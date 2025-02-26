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

    // 获取 `app/` 目录下当前存在的图片文件
    const existingFiles = fs.readdirSync(iconsDir)
      .filter(file => /\.(png|jpg|jpeg|svg|gif)$/.test(file));

    // 生成新的 `icons` 数组
    const updatedIcons = existingFiles.map(file => ({
      name: path.basename(file, path.extname(file)), // 去掉扩展名
      url: repoRawURL + file
    }));

    // 检查 `app.json` 中是否有已删除的文件
    const updatedUrls = new Set(updatedIcons.map(icon => icon.url));

    // 过滤掉 `app.json` 中不存在于 `app/` 目录的图标
    jsonData.icons = jsonData.icons.filter(icon => updatedUrls.has(icon.url));

    // 计算新增的图标
    const newIcons = updatedIcons.filter(icon => !jsonData.icons.some(e => e.url === icon.url));

    if (newIcons.length === 0 && jsonData.icons.length === updatedIcons.length) {
      console.log("No changes needed.");
      return;
    }

    // 添加新图标
    jsonData.icons.push(...newIcons);

    // 写回 JSON 文件
    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });
    console.log("Updated app.json successfully.");
  } catch (error) {
    console.error("Error updating app.json:", error);
    process.exit(1);
  }
}

// 运行更新函数
updateJsonFile();
