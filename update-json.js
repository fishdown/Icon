const fs = require("fs-extra");
const path = require("path");

const jsonFilePath = "app.json"; // JSON 文件路径
const iconsDir = "app/"; // 监听的图标文件夹
const repoRawURL = "https://raw.githubusercontent.com/fishdown/Icon/master/app/"; // GitHub RAW 地址

async function updateJsonFile() {
  try {
    // 读取 JSON 文件（如果不存在，则创建默认结构）
    let jsonData = await fs.readJson(jsonFilePath).catch(() => ({
      name: "app",
      description: "部分app图标,@fishdown",
      icons: []
    }));

    // 确保 JSON 数据包含 icons 数组
    if (!Array.isArray(jsonData.icons)) {
      jsonData.icons = [];
    }

    // 获取 `app/` 目录下当前实际存在的图片文件
    const existingFiles = fs.readdirSync(iconsDir)
      .filter(file => /\.(png|jpg|jpeg|svg|gif)$/i.test(file)); // 只保留图片格式

    // 生成新的 `icons` 数组（基于 app/ 目录实际内容）
    let updatedIcons = existingFiles.map(file => ({
      name: path.basename(file, path.extname(file)), // 去掉扩展名
      url: repoRawURL + file
    }));

    // 处理 loon-icon 和 loon 的顺序
    const loonIcon = updatedIcons.find(icon => icon.name === "loon-icon");
    const loon = updatedIcons.find(icon => icon.name === "loon");

    // 过滤掉 loon-icon 和 loon，避免重复添加
    updatedIcons = updatedIcons.filter(icon => icon.name !== "loon-icon" && icon.name !== "loon");

    // 确保 loon-icon 在第一位，loon 在第二位
    const finalIcons = [];
    if (loonIcon) finalIcons.push(loonIcon);
    if (loon) finalIcons.push(loon);
    finalIcons.push(...updatedIcons); // 追加剩余的图标

    // 直接替换 `app.json` 中的 icons 数组，保持与 `app/` 目录一致
    jsonData.icons = finalIcons;

    // 写回 JSON 文件
    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });
    console.log("✅ app.json has been updated to match app/ folder.");
  } catch (error) {
    console.error("❌ Error updating app.json:", error);
    process.exit(1);
  }
}

// 运行更新函数
updateJsonFile();
