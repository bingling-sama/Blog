import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(process.cwd(), "blog/public");
const IMAGES_DIR = path.resolve(PUBLIC_DIR, "images");
const BLOG_DIR = path.resolve(process.cwd(), "blog");
const SUPPORTED_EXTS = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".avif"]);
const MAX_WIDTH = 1920; // 宽屏合理上限，避免 4K/Retina 截图过大
const WEBP_QUALITY = 85; // 高保真有损压缩，视觉无损且比 lossless 体积小 80%+

/**
 * 递归收集指定目录下所有文件
 */
function walk(dir, filter) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item.startsWith(".")) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath, filter));
    } else if (!filter || filter(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 主流程
 */
async function main() {
  console.log("🔍 扫描需要转换和优化的图片...");

  // 1. 扫描 blog/public 下所有非 webp 格式图片 (除 favicon 外)
  const imageFiles = walk(PUBLIC_DIR, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);
    if (basename === "favicon.png") return false;
    return SUPPORTED_EXTS.has(ext);
  });

  const convertedList = [];

  if (imageFiles.length > 0) {
    console.log(`🚀 发现 ${imageFiles.length} 张待转换图片，开始转为高保真 WebP...`);

    for (const inputPath of imageFiles) {
      const ext = path.extname(inputPath);
      const outputPath = inputPath.slice(0, -ext.length) + ".webp";

      const oldStat = fs.statSync(inputPath);

      // 调整最大宽度并采用高质量 WebP 编码 (quality: 85, effort: 5)
      await sharp(inputPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toFile(outputPath);

      const newStat = fs.statSync(outputPath);
      const ratio = (((oldStat.size - newStat.size) / oldStat.size) * 100).toFixed(1);

      console.log(
        `  ✓ 转换: ${path.relative(process.cwd(), inputPath)} -> ${path.basename(outputPath)} ` +
        `(${formatSize(oldStat.size)} -> ${formatSize(newStat.size)}, 节省 ${ratio}%)`
      );

      // 删除原始文件
      fs.unlinkSync(inputPath);

      convertedList.push({
        oldFullPath: inputPath,
        newFullPath: outputPath,
        oldBasename: path.basename(inputPath),
        newBasename: path.basename(outputPath),
        oldRelativeFromImages: path.relative(IMAGES_DIR, inputPath).replace(/\\/g, "/"),
        newRelativeFromImages: path.relative(IMAGES_DIR, outputPath).replace(/\\/g, "/")
      });
    }
  }

  // 2. 检查现存的 WebP 图片（优化之前用 lossless 生成导致体积过大的文件）
  const existingWebpFiles = walk(PUBLIC_DIR, (filePath) => filePath.endsWith(".webp"));
  for (const webpPath of existingWebpFiles) {
    const stat = fs.statSync(webpPath);
    const meta = await sharp(webpPath).metadata();
    
    // 如果原图宽于 MAX_WIDTH 或 单图大于 150KB，尝试优化
    if ((meta.width && meta.width > MAX_WIDTH) || stat.size > 150 * 1024) {
      const tempOutput = webpPath + ".tmp.webp";
      await sharp(webpPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toFile(tempOutput);

      const newStat = fs.statSync(tempOutput);
      if (newStat.size < stat.size * 0.85) {
        // 体积至少减少 15% 以上才替换
        fs.renameSync(tempOutput, webpPath);
        const ratio = (((stat.size - newStat.size) / stat.size) * 100).toFixed(1);
        console.log(
          `  ⚡ 重新压缩 WebP: ${path.relative(process.cwd(), webpPath)} ` +
          `(${meta.width}x${meta.height} -> 最大宽 ${MAX_WIDTH}, ${formatSize(stat.size)} -> ${formatSize(newStat.size)}, 节省 ${ratio}%)`
        );
      } else {
        fs.unlinkSync(tempOutput);
      }
    }
  }

  // 3. 检查 favicon.png（如果是超大原图，缩放至 128x128）
  const faviconPath = path.join(PUBLIC_DIR, "favicon.png");
  if (fs.existsSync(faviconPath)) {
    const favStat = fs.statSync(faviconPath);
    if (favStat.size > 50 * 1024) {
      const tempFav = faviconPath + ".tmp.png";
      await sharp(faviconPath)
        .resize({ width: 128, height: 128, fit: "contain" })
        .png({ compressionLevel: 9 })
        .toFile(tempFav);
      const newFavStat = fs.statSync(tempFav);
      fs.renameSync(tempFav, faviconPath);
      console.log(`  ✓ 优化 favicon.png: ${formatSize(favStat.size)} -> ${formatSize(newFavStat.size)}`);
    }
  }

  // 2. 扫描博客所有 Markdown 文件，同步更新引用
  console.log("📝 正在更新 Markdown 中的图片引用...");

  const mdFiles = [
    ...walk(path.join(BLOG_DIR, "posts"), (f) => f.endsWith(".md")),
    ...walk(path.join(BLOG_DIR, "pages"), (f) => f.endsWith(".md")),
    ...(fs.existsSync(path.join(BLOG_DIR, "index.md")) ? [path.join(BLOG_DIR, "index.md")] : [])
  ];

  const modifiedMdFiles = [];

  for (const mdPath of mdFiles) {
    let content = fs.readFileSync(mdPath, "utf8");
    let changed = false;

    for (const item of convertedList) {
      // 匹配各种引用风格:
      // 1) /images/path/to/foo.png -> /images/path/to/foo.webp
      // 2) images/path/to/foo.png -> images/path/to/foo.webp
      // 3) ![[foo.png]] 或 ![[foo.png|options]] -> ![[foo.webp]] / ![[foo.webp|options]]
      // 4) HTML 标签 <img src="...foo.png"

      const oldPathEscaped = item.oldRelativeFromImages.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const oldBasenameEscaped = item.oldBasename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // 替换以 /images/ 或 images/ 开头的路径
      const pathRegex = new RegExp(`(\\/?images\\/)${oldPathEscaped}`, "g");
      if (pathRegex.test(content)) {
        content = content.replace(pathRegex, `$1${item.newRelativeFromImages}`);
        changed = true;
      }

      // 替换 Obsidian wikilink 格式: ![[filename.ext]] 或 ![[filename.ext|...]]
      const wikilinkRegex = new RegExp(`(!\\[\\[)${oldBasenameEscaped}(\\]\\]|\\|)`, "g");
      if (wikilinkRegex.test(content)) {
        content = content.replace(wikilinkRegex, `$1${item.newBasename}$2`);
        changed = true;
      }

      // 兼容可能存在的直接 basename 引用
      const rawBasenameRegex = new RegExp(`(!\\[[^\\]]*\\]\\([^)]*?)${oldBasenameEscaped}(\\))`, "g");
      if (rawBasenameRegex.test(content)) {
        content = content.replace(rawBasenameRegex, `$1${item.newBasename}$2`);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(mdPath, content, "utf8");
      modifiedMdFiles.push(mdPath);
      console.log(`  ✓ 已更新: ${path.relative(process.cwd(), mdPath)}`);
    }
  }

  // 3. 如果在 git 环境中，自动暂存更改 (针对 pre-commit hook 自动生效)
  try {
    for (const item of convertedList) {
      execSync(`git add "${item.newFullPath}" "${item.oldFullPath}"`, { stdio: "ignore" });
    }
    for (const mdPath of modifiedMdFiles) {
      execSync(`git add "${mdPath}"`, { stdio: "ignore" });
    }
  } catch {
    // 忽略非 git 仓库或暂存失败
  }

  console.log("🎉 全部图片转换与 Markdown 引用更新完成！");
}

main().catch((err) => {
  console.error("❌ 处理图片时出错:", err);
  process.exit(1);
});
