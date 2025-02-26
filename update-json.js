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

    // 获取 app 目录下的所有图片文件
    const files = fs.readdirSync(iconsDir)
      .filter(file => /\.(png|jpg|jpeg|svg|gif)$/.test(file));

    // 获取已有的 URL 列表，防止重复添加
    const existingUrls = new Set(jsonData.icons.map(icon => icon.url));

    // 处理新文件，转换成 { name, url } 格式
    const newIcons = files
      .map(file => ({
        name: path.basename(file, path.extname(file)), // 文件名去掉扩展名
        url: repoRawURL + file
      }))
      .filter(icon => !existingUrls.has(icon.url)); // 过滤掉已有的 URL

    if (newIcons.length === 0) {
      console.log("No new icons to add.");
      return;
    }

    // 更新 JSON 数据
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
