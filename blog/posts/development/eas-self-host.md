---
date: 2026-09-07 08:04:26
updated: 2026-09-11 12:00:15
title: Expo OTA 自建全流程：深入解析 XPREM 核心架构、运行模式与工程落地
description: 全面拆解 Expo Updates 协议自建服务 XPREM 的端到端链路组件，深度对比 Stateless 与 Control Plane 模式的架构差异与部署配置，并提供工业级 CDN 与灰度发布实操。
category: Development
tags:
  - Expo
  - ReactNative
  - OTA
  - Mobile
  - DevOps
---

# Expo OTA 自建全流程：深入解析 XPREM 核心架构、运行模式与工程落地

在 React Native / Expo 项目进入稳定迭代后，官方 EAS Update 会面临两个现实问题：按 MAU 阶梯计费的成本随着用户增长迅速走高；而在国内部署或政企内网场景下，官方 CDN 与接口常受限于网络延迟和合规要求。

XPREM（前身为 `expo-open-ota`）是一个用 Go 实现的开源 Expo Updates 协议服务端。客户端保持 Expo 原生 `expo-updates` 运行库不变，只需把更新端点指向私有服务，就能在自有设施上实现热更新。

很多团队在接入时容易把 XPREM 误认为是一个单纯的“S3 静态文件转发器”，忽略了其底层的状态持久化机制、密钥治理模型以及资源寻址策略。本文将 XPREM 热更新链路中的 7 个核心组件逐一拆开剖析，并详细拆解 **Stateless 模式** 与 **Control Plane 模式** 在部署、密钥管理与发布逻辑上的根本差异，提供两套可直接上线的工业级实操配置。

---

## 一、 XPREM 架构总览：端到端链路拆解

OTA 热更新是一套高度依赖端云协同的协议体系。从开发者执行发布，到最终用户设备完成更新加载，整个系统被划分为 7 个职责明确的子系统：

```mermaid
flowchart TD
    subgraph PublisherEnv ["1. 发布工具链 (Developer / CI)"]
        CLI["eoas CLI<br/>(expo export + CAS 哈希比对)"]
    end

    subgraph ClientEnv ["2. 客户端运行时 (Expo Mobile App)"]
        AppRuntime["expo-updates 原生运行时<br/>(内嵌 certificate.pem · 版本契约校验)"]
    end

    subgraph GatewayLayer ["3. 接入网关 (Reverse Proxy)"]
        Nginx["Nginx / Ingress<br/>(SSL 终结 · 证书卸载 · 大文件上传透传)"]
    end

    subgraph CoreEngine ["4. XPREM 核心计算引擎 (Go)"]
        Server["XPREM Server<br/>(Manifest 动态计算 · RSA 签名 · 灰度哈希分流)"]
        AuthLayer["鉴权子系统<br/>(EOO_TOKEN / Expo API / JWT)"]
        SigningEngine["代码签名引擎<br/>(RSA 私钥签名 · 生成 expo-signature)"]
    end

    subgraph StateLayer ["5. 状态与元数据层"]
        Postgres[("PostgreSQL 16 (Control Plane)<br/>(App/Branch/Channel/加密私钥)")]
        BucketMarkers[("Bucket 标记文件 (Stateless)<br/>(update-metadata.json / .check)")]
    end

    subgraph StorageLayer ["6. 对象存储与 CAS 资产库"]
        Bucket[("S3 兼容对象存储<br/>(cas/{sha256} · 内容寻址去重)")]
    end

    subgraph EdgeLayer ["7. 边缘分发网络 (CDN)"]
        CDN["边缘 CDN 节点<br/>(365天强缓存 · 域名重写)"]
    end

    %% 发布流程
    CLI -->|"① 发布鉴权 & 哈希比对"| Server
    CLI -->|"② 上传增量资源"| Bucket
    Server -->|"③ 写入发布状态"| StateLayer

    %% 客户端检查更新流程
    AppRuntime -->|"④ 检查更新 GET /api/manifest"| Nginx
    Nginx --> Server
    Server -->|"⑤ 读取分支/通道/密钥"| StateLayer
    Server -.->|"⑥ 返回签名 Manifest (含 CDN 下载 URL)"| AppRuntime

    %% 客户端资源拉取流程
    AppRuntime ==>|"⑦ 并发下载 Bundle 与 Assets"| CDN
    CDN -->|"首次回源 Cache Miss"| Bucket
```

我们将这 7 个部分拆开，逐层分析其内部机制与工程约束：

### 1. 发布工具链（Publisher CLI）
- **核心组件**：官方维护的 `eoas` CLI（兼容 `@mercuretechnologies/xprem`）。
- **运行机制**：
  1. 调用 `expo export` 将前端代码和资源编译为 Hermes 字节码（HBC）、JS Bundle 以及 Assets 静态资源。
  2. 对每个编译产物计算 SHA-256 哈希值，先向 XPREM 发送哈希清单进行比对。
  3. 服务端若已存在对应哈希文件，CLI 将**跳过该文件的物理上传**。
  4. 仅将全量更新中新增或修改的文件上传至存储，大幅削减 CI/CD 耗时与上行流量。

### 2. 客户端原生运行时（expo-updates Runtime）
- **核心组件**：移动端原生库 `expo-updates`（嵌入在 iOS IPA / Android APK 中）。
- **工作机制**：
  1. **参数上报**：在应用冷启动或前台切回时，向配置的更新 URL 发送 HTTP GET 请求，通过 Header 上报当前硬件平台（`expo-platform`）、运行时版本（`expo-runtime-version`）、当前固化的发布通道（`expo-channel-name`）以及设备标识（`EAS-Client-ID`）。
  2. **签名验证**：收到服务端下发的 Manifest 后，利用本地打包时内置的 `certificate.pem` 公钥证书，验证响应头中的 `expo-signature` 签名有效性。签名损坏或不匹配直接中断更新。
  3. **增量组装与切换**：客户端读取 Manifest 内列出的资源下载链接，比对本地缓存，仅下载缺失资源；下载完成后在本地原子切换生效。

### 3. 接入网关层（Gateway / Reverse Proxy）
- **核心组件**：Nginx、Traefik、Caddy 或 K8s Ingress Controller。
- **必备能力**：
  1. **强制 HTTPS**：Expo Updates 官方规范强制要求 manifest 接口必须运行在 HTTPS 协议之上，网关层负责 SSL/TLS 证书终结。
  2. **解除上传限制**：发布端上传的完整 Bundle 和素材包体积可达数十至数百 MB，网关必须显式放开 `client_max_body_size`（如 `200M`），否则发布时会触发 `413 Request Entity Too Large`。
  3. **网络与真实 IP 透传**：透传 `X-Real-IP`、`X-Forwarded-For`，为服务端的地理位置解析（GeoIP）与审计日志提供真实源 IP。

### 4. XPREM 核心计算引擎（Go Core Engine）
- **核心组件**：单静态二进制 Go 进程（无外部语言运行时依赖）。
- **处理职责**：
  1. **路由与通道映射**：根据请求中的 `expo-channel-name` 或 `xprem-branch` 映射对应的目标分支。
  2. **灰度计算（Progressive Rollout）**：对 `EAS-Client-ID` 结合发布版本 Salt 执行确定性哈希运算（Deterministic Hash），计算设备是否落在灰度比例区间内。
  3. **Manifest 动态构建与签名**：动态将各资源的下载地址替换为 CDN 域名，随后利用对应应用的 RSA 私钥对整个 Manifest 计算 SHA-256 签名，生成 `expo-signature` 标头返回。

### 5. 状态与元数据层（State & Metadata Layer）
- **核心职责**：管理应用列表、分支关联、通道指向、更新版本记录、代码签名密钥以及审计日志。
- **差异实现**：
  - 在 **Control Plane 模式** 下，由 **PostgreSQL 16** 统一接管，支持复杂查询、多应用租户隔离与安全加密。
  - 在 **Stateless 模式** 下，**完全没有数据库**，元数据作为 JSON 文件直接保存在对象存储的特定目录下。

### 6. 对象存储与 CAS 资产库（Storage Backend & CAS）
- **核心组件**：Amazon S3、Cloudflare R2、七牛云 Kodo、MinIO 等 S3 兼容协议存储。
- **存储拓扑（v3.2.0+ CAS 架构）**：
  ```
  my-ota-bucket/
  └── {appId}/
      ├── cas/
      │   ├── 0a1b2c3d4e5f...       # 静态资源或 Bundle，以 SHA-256 哈希命名
      │   └── a9b8c7d6e5f4...
      └── {branch}/
          └── {runtimeVersion}/     # 版本元数据索引
  ```
  所有二进制资源脱离版本路径，统一收敛在 `cas/` 目录下由哈希直接定位。跨版本相同的文件在物理层面只有一份存储实体。

### 7. 边缘分发网络（CDN Delivery Layer）
- **核心组件**：七牛云 CDN、Cloudflare、CloudFront、Fastly 等。
- **核心机制**：
  - 承载全站 99% 以上的流量压力。客户端从 Manifest 中获取的都是经过 XPREM 改写后的 CDN 资源链接。
  - 由于 CAS 哈希文件具备强不可变性（内容变则哈希必变），CDN 边缘节点配置 365 天长效强缓存，静态资源几乎不会回源到对象存储。

---

## 二、 运行模式深度对比：Stateless vs. Control Plane

XPREM 在服务启动阶段，会检查是否存在环境变量 `DB_URL`。**这是切换两种模式的唯一判定开关**。

```mermaid
flowchart TD
    Start(["XPREM 启动初始化"]) --> Check{"环境变量检测<br/>os.Getenv('DB_URL')"}

    Check -->|"未配置 (空值)"| Stateless["Stateless Mode<br/>(极简无状态模式)"]
    Check -->|"已配置 (PostgreSQL 连接串)"| ControlPlane["Control Plane Mode<br/>(企业控制平面模式 · 推荐)"]

    subgraph S_Box ["无状态模式特征"]
        Stateless --- S1["• 仅依赖 S3/OSS 对象存储<br/>• 强绑定官方 Expo 账号与 API<br/>• 单实例仅支持单 App 托管<br/>• 仅支持全量发布与快速回滚"]
    end

    subgraph C_Box ["控制平面特征"]
        ControlPlane --- C1["• PostgreSQL 16 集中持久化<br/>• 零依赖 Expo 账号，完全自治<br/>• 单集群多 App 租户隔离<br/>• 支持 1%~99% 灰度发布与差分补丁"]
    end
```

两者的底层架构存在本质分野，特性对比如下：

| 对比维度 | 无状态模式 (Stateless) | 控制平面模式 (Control Plane，推荐) |
| --- | --- | --- |
| **底层持久化** | **零数据库**，仅依赖对象存储 Bucket | **PostgreSQL 16** + 对象存储 (+ ClickHouse 可选) |
| **Expo 账号依赖** | **强绑定**：发布鉴权与通道映射需实时调用 Expo API | **零依赖**：完全自治，无需任何 Expo 官方账号 |
| **应用托管容量** | **单应用**：一个服务进程只能绑定一个 `EXPO_APP_ID` | **多应用隔离**：单集群托管多个项目，基于 `expo-app-id` 租户隔离 |
| **签名私钥管理** | **人工管理**：需挂载本地 PEM 文件或注入 Base64 变量 | **服务端自理**：控制台建项目时自动生成，AES 主密钥加密落库 |
| **发布凭证体系** | 透传 `EXPO_TOKEN` 或本地 `eas login` 建立的 Session | 控制台生成的应用专属 `EOO_TOKEN`，细粒度权限控制 |
| **渐进式灰度** | **不支持**（传入 `--rollout-percentage` 直接拦截报错） | **支持**（1%~99% 确定性设备哈希分流，单向推进） |
| **差分补丁 (bsdiff)** | **不支持** | **支持**（后台异步生成二进制增量补丁） |
| **历史查询性能** | 随版本递增而变慢（需遍历 S3 目录树，重度依赖缓存） | 极快（标准 SQL 索引查询，支撑高并发元数据检索） |
| **适用场景** | 个人业余项目、临时验证环境、排斥维护数据库的场景 | 商业化生产环境、多 App 统一发布平台、私有化合规交付 |

---

## 三、 实战部署方案 A：无状态模式（Stateless Mode）

如果团队目前只有一个 App，希望以最低运维负担快速上线，且不介意借助官方 Expo 账号管理分支映射与发布鉴权，Stateless 模式是最轻量的路线。

### 1. 生成并准备签名证书对
在 Stateless 模式下，XPREM 不管理私钥生成，你必须在本地手动生成 RSA 密钥对：

```bash
mkdir -p xprem-stateless/certs && cd xprem-stateless

# 使用 eoas CLI 交互式生成签名对
npx eoas generate-certs
```
命令执行完毕后会生成三个文件：
- `private-key.pem`：服务端签名私钥（**严禁泄露，稍后挂载给 XPREM 容器**）。
- `public-key.pem`：公钥文件。
- `certificate.pem`：验签证书（**放入移动端前端工程 `certs/` 目录下**）。

### 2. 编写 Stateless 部署配置 (Docker Compose)
创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  xprem-stateless:
    image: mercuretechnologies/xprem:latest
    container_name: xprem-stateless
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      # 挂载本地私钥与公钥文件供服务端执行签名
      - ./certs/private-key.pem:/certs/private-key.pem:ro
      - ./certs/public-key.pem:/certs/public-key.pem:ro
    environment:
      PORT: 3000
      BASE_URL: "https://ota-api.yourdomain.com"

      # 模式关键：严禁配置 DB_URL，配置即会切换为 Control Plane 模式

      # 关联官方 Expo 应用与访问令牌
      EXPO_APP_ID: "your-expo-project-uuid"
      EXPO_ACCESS_TOKEN: "your_expo_personal_access_token"

      # 密钥存储配置（指定为本地文件路径）
      KEYS_STORAGE_TYPE: "local"
      PRIVATE_LOCAL_EXPO_KEY_PATH: "/certs/private-key.pem"
      PUBLIC_LOCAL_EXPO_KEY_PATH: "/certs/public-key.pem"

      # 存储配置 (以 S3 / 七牛云 Kodo 为例)
      STORAGE_MODE: "s3"
      AWS_REGION: "cn-east-1"
      AWS_BASE_ENDPOINT: "https://s3-cn-east-1.qiniucs.com"
      S3_BUCKET_NAME: "my-ota-bucket"
      AWS_ACCESS_KEY_ID: "YOUR_QINIU_ACCESS_KEY"
      AWS_SECRET_ACCESS_KEY: "YOUR_QINIU_SECRET_KEY"
      AWS_S3_FORCE_PATH_STYLE: "false"

      # 静态资源 CDN 域名
      CDN_BASE_URL: "https://ota-assets.yourdomain.com"

      # 控制台管理员账号（Stateless 下为只读面板，账密每次启动必填）
      ADMIN_EMAIL: "admin@yourdomain.com"
      ADMIN_PASSWORD: "AdminPassword123!"
      USE_DASHBOARD: "true"
```

启动服务：
```bash
docker compose up -d
```

### 3. Stateless 模式发布更新工作流
在无状态模式下，发布命令必须遵循以下两项铁律：
1. **严禁配置 `EOO_TOKEN`**：如果环境变量中出现 `EOO_TOKEN`，CLI 会强行使用控制平面鉴权，导致请求被无状态服务端拒绝。
2. **使用 Expo 鉴权**：通过 `EXPO_TOKEN` 或已登录的 EAS 账号鉴权。
3. **在 Expo 控制台创建通道**：分支与通道必须先在 Expo 官方后台配置完毕。

```bash
# 必须使用 EXPO_TOKEN 进行鉴权
export EXPO_TOKEN="your_expo_access_token"
unset EOO_TOKEN

npx eoas publish \
  --branch production \
  -m "Stateless 模式发布更新" \
  --platform all
```

---

## 四、 实战部署方案 B：控制平面模式（Control Plane Mode，生产级）

在生产环境中，强烈建议部署完整的 Control Plane 模式。它不仅消除了对 Expo 官方基础设施的单点依赖，还带来了多应用集中管理、安全私钥落库以及 1%~99% 灰度发布能力。

### 1. 生成服务端核心机密
控制平面需要两组关键 Secret：
1. `JWT_SECRET`：用于控制台 Session 鉴权与上传授权。
2. `DB_KEYS_MASTER_KEY_B64`：**核心主密钥**。XPREM 每次新建 App 生成的 RSA 私钥都会被该主密钥在内存中加密后再写入 PostgreSQL。

在服务器上执行：
```bash
mkdir -p /data/xprem && cd /data/xprem

# 生成 32 字节 Base64 字符串
openssl rand -base64 32  # 记录为 JWT_SECRET
openssl rand -base64 32  # 记录为 DB_KEYS_MASTER_KEY_B64
```

> **安全硬约束**：`DB_KEYS_MASTER_KEY_B64` 必须永久离线备份。如果主密钥丢失或被覆盖，数据库中所有应用的签名私钥都将彻底无法解密，已发布上线的客户端将永远无法接收后续更新！

### 2. 编写 Control Plane 部署配置 (Docker Compose)
创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  xprem-postgres:
    image: postgres:16-alpine
    container_name: xprem-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: xprem_user
      POSTGRES_PASSWORD: ReplaceWithStrongDBPass999!
      POSTGRES_DB: xprem_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - xprem-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U xprem_user -d xprem_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  xprem-server:
    image: mercuretechnologies/xprem:latest
    container_name: xprem-server
    restart: unless-stopped
    depends_on:
      xprem-postgres:
        condition: service_healthy
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      PORT: 3000
      BASE_URL: "https://ota-api.yourdomain.com"
      USE_DASHBOARD: "true"
      DASHBOARD_ROOT_REDIRECT: "true"

      # 首次启动数据库初始化管理员账号（写入数据库后后续重启不再读取）
      ADMIN_EMAIL: "admin@yourdomain.com"
      ADMIN_PASSWORD: "AdminSecurePassword2026!"

      # 数据库与主密钥（配置 DB_URL 即启用 Control Plane）
      DB_URL: "postgres://xprem_user:ReplaceWithStrongDBPass999!@xprem-postgres:5432/xprem_db?sslmode=disable"
      DB_KEYS_MASTER_KEY_B64: "YOUR_GENERATED_MASTER_KEY_HERE"
      JWT_SECRET: "YOUR_GENERATED_JWT_SECRET_HERE"

      # 对象存储设置 (S3 兼容协议，支持七牛 / MinIO / R2 / S3)
      STORAGE_MODE: "s3"
      AWS_REGION: "cn-east-1"
      AWS_BASE_ENDPOINT: "https://s3-cn-east-1.qiniucs.com"
      S3_BUCKET_NAME: "my-ota-bucket"
      AWS_ACCESS_KEY_ID: "YOUR_QINIU_ACCESS_KEY"
      AWS_SECRET_ACCESS_KEY: "YOUR_QINIU_SECRET_KEY"
      AWS_S3_FORCE_PATH_STYLE: "false"

      # 静态资源 CDN 域名 (末尾严禁加斜杠)
      CDN_BASE_URL: "https://ota-assets.yourdomain.com"

      # 可选：开启 bsdiff 差分补丁，降低客户端更新包大小
      BUNDLE_DIFFING: "false"
    networks:
      - xprem-net

volumes:
  pgdata:

networks:
  xprem-net:
    driver: bridge
```

启动集群：
```bash
docker compose up -d
docker compose logs -f xprem-server
```
日志中出现数据库迁移完成与监听端口信息即代表启动成功。

### 3. 控制台初始化应用与获取密钥
访问 `https://ota-api.yourdomain.com/dashboard`：
1. **创建应用**：点击 **Applications -> Create New Application**。
   - 在此模式下，**你不需要手动生成密钥文件**。服务端在创建应用时，会自动生成高强度 RSA 密钥对，并使用 `DB_KEYS_MASTER_KEY_B64` 加密存入 PostgreSQL。
2. **下载验签公钥**：进入新建应用的 **App Info** 页面，点击右上角 **Download certificate**，保存为 `certs/certificate.pem`，提交进 Expo 前端工程仓库。记录页面上的 **App ID**（UUID）。
3. **生成发布 API Token**：进入控制台 **API tokens** 页面，为当前应用创建发布 Token，复制保存备用（即 `EOO_TOKEN`）。
4. **绑定通道与分支**：进入 **Channels -> Create Channel**，创建 `production` 通道，并指定映射至 `production` 分支。

---

## 五、 接入网关与 CDN 边缘缓存配置

无论采用哪种模式，接入层与 CDN 的配置逻辑是共通的。

### 1. Nginx 反向代理配置
```nginx
server {
    listen 80;
    server_name ota-api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ota-api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ota-api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ota-api.yourdomain.com/privkey.pem;

    # 解除请求体大小限制，避免大 Bundle 发布被截断
    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. CDN 边缘缓存策略（极度关键）
在 CDN 控制台为 `ota-assets.yourdomain.com` 添加配置：
1. **缓存过期时间**：
   - 针对路径 `/cas/*`、`/assets/*` 以及文件后缀 `bundle,js,hbc,png,jpg,webp,ttf,json`，设置缓存有效时间为 **365 天**。
   - *依据：CAS 机制保障了哈希文件的一致性，同名文件内容永不改变。*
2. **强制缓存覆盖 (Ignore Origin Cache-Control)**：开启该选项，强制覆盖对象存储可能默认下发的短寿命 Header。
3. **忽略 URL 随机参数 (Ignore Query String)**：防止端上打点库追加追踪参数击穿 CDN 缓存。

---

## 六、 Expo 客户端工程集成契约

在 Expo 项目的 `app.config.ts` 中声明端上配置。这是客户端能够成功接入自建服务的核心契约：

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyProductionApp',
  slug: 'my-production-app',
  version: '1.0.0',

  // 1. 严格使用固定字符串指定原生版本号（仅原生依赖变更时才升级）
  runtimeVersion: '1.0.0',

  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://ota-api.yourdomain.com/api/manifest',

    // 2. 挂载下载的验签公钥证书
    codeSigningCertificate: './certs/certificate.pem',
    codeSigningMetadata: {
      keyid: 'main',
      alg: 'rsa-v1_5-sha256',
    },

    // 3. 必须显式声明请求头，否则 expo-updates 原生层不会发送给服务端
    requestHeaders: {
      'expo-channel-name': 'production',
      'expo-app-id': 'YOUR_DASHBOARD_APP_UUID', // Stateless 模式下为 EAS Project ID
      'xprem-branch': 'production',
    },
  },
});
```

---

## 七、 生产发布与灰度控制（Control Plane）

### 1. 全量生产发布
```bash
export EOO_TOKEN="your_dashboard_api_token"
export RELEASE_CHANNEL="production"

npx eoas publish \
  --branch production \
  -m "fix: 修复个人中心数据刷新异常" \
  --platform all
```

### 2. 渐进式灰度发布 (Progressive Rollout)
对于涉及核心链路改造的版本，使用 `--rollout-percentage` 限制分流范围：

```bash
npx eoas publish \
  --branch production \
  --rollout-percentage 10 \
  -m "feat: 支付流程升级 (灰度 10%)"
```
- **哈希命中逻辑**：XPREM 会取出客户端上报的 `EAS-Client-ID`，与当前 Rollout 随机 Salt 进行哈希，映射到 0~99 区间。该算法在设备端无需维持会话即可确保单台设备在灰度期间的命中结果恒定不变。
- **动态推进**：可在 XPREM 控制台中随时将比例调大至 25%、50%、100%，或点击 **Promote to 100%**。灰度推进**只允许单调递增**。

### 3. 秒级版本故障回滚 (Rollback)
当线上最新版本出现灾难性缺陷，无需等待代码重新打包编译，执行回滚指令：

```bash
npx eoas rollback --branch production
```
执行后，服务端会向 `production` 分支下发包含 `rollBackToEmbedded` 指令的特殊清单。客户端收到后会立即清空本地热更新缓存，回退至随安装包原生编译打包的基线版本。

---

## 八、 避坑与排错清单

### 1. 禁用 `--no-dumpSourcemap` 避免 CAS 缓存失效
`eoas publish` 默认会附加 `--dumpSourcemap` 参数。**不要显式禁用它**。
- **深层机理**：Hermes 编译器在未指定 SourceMap 输出时，会在编译生成的 HBC 字节码末尾注入临时系统的随机绝对路径。这会导致相同的源代码在不同时间或不同机器上构建出的 `.hbc` 哈希值完全不同，使得 CAS 内容寻址去重机制彻底失效，导致大量冗余文件上传与 CDN 缓存重复刷新。

### 2. CI/CD 流水线中 Git 脏检查中断
`eoas publish` 默认要求当前工作目录处于干净的 Git 提交状态。若 CI 流水线前序脚本生成了临时文件，会直接报错中止：`Commit all changes. Aborting...`。
- **应对方案**：在 CI 构建脚本中加入 `--nonInteractive`，并声明 `EAS_NO_VCS=1` 或附加 `--disableRepositoryCheck`：
  ```bash
  EOO_TOKEN=$CI_SECRET_TOKEN \
  RELEASE_CHANNEL=production \
  npx eoas publish \
    --branch production \
    --nonInteractive \
    --disableRepositoryCheck
  ```

### 3. 部署后接口与签名验证 (curl 诊断命令)
部署完成后，可通过模拟客户端 HTTP Header 快速验证端点连通性：

```bash
curl -i https://ota-api.yourdomain.com/api/manifest \
  -H "expo-platform: ios" \
  -H "expo-runtime-version: 1.0.0" \
  -H "expo-channel-name: production" \
  -H "expo-app-id: YOUR_DASHBOARD_APP_UUID"
```

**自检核验标准**：
1. HTTP 状态码为 `200 OK`。
2. 响应头包含合法的代码签名：`expo-signature: keyid="main",alg="rsa-v1_5-sha256",sig="..."`。
3. 响应 JSON 体内各 Asset 资源的 `url` 域名前缀已被重写为配置的 CDN 域名（如 `https://ota-assets.yourdomain.com/cas/...`）。
4. 任选一个 Asset 资源 URL，执行 `curl -I <asset_url>`，确认响应头包含 `Cache-Control: max-age=31536000`，且多次请求后出现 `X-Cache: HIT` 标记。
