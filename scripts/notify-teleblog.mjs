import fs from "node:fs";
import crypto from "node:crypto";

const WORKER_URL = process.env.TELEBLOG_WORKER_URL;
const PRIVATE_KEY_HEX = process.env.TELEBLOG_PRIVATE_KEY_HEX;
const SITE_URL = (process.env.SITE_URL || "https://blog.booling.cn").replace(/\/+$/, "");
const IS_DRY_RUN = process.argv.includes("--dry-run");

/**
 * 校验必要环境变量
 */
function getPrivateKeyObject(hexKey) {
  if (!hexKey) {
    throw new Error("Missing TELEBLOG_PRIVATE_KEY_HEX");
  }

  const cleanedHex = hexKey.trim();
  if (cleanedHex.length !== 64) {
    throw new Error(
      `Invalid private key length: expected 64 hex characters (32 bytes), got ${cleanedHex.length}`
    );
  }

  const privateKeyDer = Buffer.concat([
    Buffer.from("302e020100300506032b657004220420", "hex"),
    Buffer.from(cleanedHex, "hex")
  ]);

  return crypto.createPrivateKey({
    key: privateKeyDer,
    format: "der",
    type: "pkcs8"
  });
}

/**
 * 解析 Markdown 文件的 Frontmatter
 */
export function parsePost(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlContent = match[1];
  const body = content.slice(match[0].length).trim();
  const frontmatter = {};

  let currentArrayKey = null;

  for (const rawLine of yamlContent.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // 匹配 YAML 列表项: - tag
    if (trimmed.startsWith("-") && currentArrayKey) {
      const item = trimmed.replace(/^-\s*/, "").replace(/^["'“”‘’]|["'“”‘’]$/g, "").trim();
      if (item) {
        frontmatter[currentArrayKey].push(item);
      }
      continue;
    }

    // 匹配 key: value
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const rawVal = line.slice(colonIndex + 1).trim();

      if (!rawVal) {
        // 后续可能为多行列表
        currentArrayKey = key;
        frontmatter[key] = [];
      } else if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
        // 内联数组形式 [A, B]
        currentArrayKey = null;
        frontmatter[key] = rawVal
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["'“”‘’]|["'“”‘’]$/g, ""))
          .filter(Boolean);
      } else {
        currentArrayKey = null;
        let val = rawVal.replace(/^["'“”‘’]|["'“”‘’]$/g, "");
        if (val.toLowerCase() === "true") val = true;
        else if (val.toLowerCase() === "false") val = false;
        frontmatter[key] = val;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * 计算 VitePress cleanUrls 规范下的最终文章链接
 */
export function getPostUrl(filePath, baseUrl = SITE_URL) {
  let relative = filePath.replace(/\\/g, "/").replace(/^blog\//, "").replace(/\.md$/, "");
  if (relative.endsWith("/index")) {
    relative = relative.slice(0, -6) || "";
  }
  return relative ? `${baseUrl}/${relative}` : `${baseUrl}/`;
}

/**
 * 若无 description，从正文中提取首段文字作为概要
 */
function extractFallbackDescription(body) {
  if (!body) return "";

  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("```") ||
      trimmed.startsWith("---") ||
      trimmed.startsWith("import ") ||
      trimmed.startsWith("<")
    ) {
      continue;
    }
    const clean = trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 去除 markdown 链接
      .replace(/[*_`~]/g, "") // 去除强调符
      .replace(/^>\s*/, ""); // 去除引用符
    if (clean.length > 10) {
      return clean.length > 200 ? `${clean.slice(0, 197)}...` : clean;
    }
  }
  return "";
}

/**
 * 推送单篇文章到 teleblog-api
 */
async function publishPost(filePath, privateKeyObj) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在，跳过: ${filePath}`);
    return;
  }

  // 1. 过滤草稿目录
  if (filePath.includes("/.drafts/") || filePath.startsWith(".drafts/")) {
    console.log(`⏩ [草稿目录跳过] ${filePath}`);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parsePost(raw);

  // 2. 过滤 draft 标记
  if (frontmatter.draft === true) {
    console.log(`⏩ [草稿标记跳过] ${filePath} (draft: true)`);
    return;
  }

  // 3. 获取文章标题
  const title = frontmatter.title;
  if (!title) {
    console.log(`⚠️ [缺少标题跳过] ${filePath}`);
    return;
  }

  // 4. 获取文章简介与标签
  const description =
    frontmatter.description ||
    frontmatter.desc ||
    extractFallbackDescription(body);

  const tagSet = new Set();
  if (Array.isArray(frontmatter.tags)) {
    frontmatter.tags.forEach((t) => tagSet.add(String(t).trim()));
  } else if (typeof frontmatter.tags === "string" && frontmatter.tags.trim()) {
    tagSet.add(frontmatter.tags.trim());
  }

  if (typeof frontmatter.category === "string" && frontmatter.category.trim()) {
    tagSet.add(frontmatter.category.trim());
  }

  const url = getPostUrl(filePath);

  const payload = {
    title: String(title).trim(),
    url,
    description: String(description || "").trim(),
    tags: Array.from(tagSet).filter(Boolean)
  };

  const jsonBody = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  console.log(`\n📄 准备推送: 《${payload.title}》`);
  console.log(`🔗 目标链接: ${payload.url}`);
  console.log(`🏷️  文章标签: ${payload.tags.join(", ") || "(无)"}`);
  console.log(`📝 文章简介: ${payload.description ? payload.description.slice(0, 80) + "..." : "(无)"}`);

  if (IS_DRY_RUN) {
    console.log(`✨ [Dry Run 演练模式] 消息已就绪，跳过真实请求调用。`);
    return;
  }

  // Ed25519 签名: `${timestamp}.${jsonBody}`
  const messageToSign = Buffer.from(`${timestamp}.${jsonBody}`);
  const signatureHex = crypto.sign(null, messageToSign, privateKeyObj).toString("hex");

  console.log(`📡 正在发送请求至 teleblog-api: ${WORKER_URL}`);
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature-Timestamp": timestamp,
      "X-Signature-Ed25519": signatureHex
    },
    body: jsonBody
  });

  const respData = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`❌ 推送失败 [HTTP ${res.status}]:`, respData);
    throw new Error(`teleblog-api responded with HTTP ${res.status}: ${JSON.stringify(respData)}`);
  }

  console.log(`🎉 推送成功! Telegram Message ID: ${respData.message_id || "(ok)"}`);
}

async function main() {
  const files = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

  if (files.length === 0) {
    console.log("ℹ️  未提供任何待推送的文件路径。");
    return;
  }

  let privateKeyObj = null;
  if (!IS_DRY_RUN) {
    if (!WORKER_URL) {
      console.error("❌ 缺少环境变量 TELEBLOG_WORKER_URL");
      process.exit(1);
    }
    try {
      privateKeyObj = getPrivateKeyObject(PRIVATE_KEY_HEX);
    } catch (err) {
      console.error(`❌ 私钥加载失败: ${err.message}`);
      process.exit(1);
    }
  }

  for (const file of files) {
    try {
      await publishPost(file, privateKeyObj);
    } catch (err) {
      console.error(`❌ 处理文章失败: ${file}`, err);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("执行脚本异常:", err);
  process.exit(1);
});
