import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import sharp from "sharp";

const IMAGES_DIR = path.resolve(process.cwd(), "blog/public/images");
const BLOG_DIR = path.resolve(process.cwd(), "blog");
const SUPPORTED_EXTS = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".avif"]);

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
  console.log("🔍 扫描需要转换的图片...");

  // 1. 扫描 blog/public/images 下所有非 webp 格式图片
  const imageFiles = walk(IMAGES_DIR, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_EXTS.has(ext);
  });

  if (imageFiles.length === 0) {
    console.log("✨ 未发现需要转换的图片，所有图片均已为 WebP 格式。");
    return;
  }

  console.log(`🚀 发现 ${imageFiles.length} 张待转换图片，开始无损转为 WebP...`);

  const convertedList = [];

  for (const inputPath of imageFiles) {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.slice(0, -ext.length) + ".webp";

    const oldStat = fs.statSync(inputPath);

    // 无损高保真转换 (lossless: true 确保 100% 像素精度)
    await sharp(inputPath)
      .webp({ lossless: true, effort: 4 })
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
