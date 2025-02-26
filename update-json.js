const fs = require("fs-extra");
const path = require("path");

const jsonFilePath = "app.json";
const iconsDir = "app/";

async function updateJsonFile() {
  try {
    // 读取 JSON 文件
    let jsonData = await fs.readJson(jsonFilePath).catch(() => ({ icons: [] }));
    
    // 确保 jsonData 有个数组字段存储图标
    if (!Array.isArray(jsonData.icons)) {
      jsonData.icons = [];
    }

    // 获取 app 目录下的所有图片文件
    const files = fs.readdirSync(iconsDir)
      .filter(file => /\.(png|jpg|jpeg|svg|gif)$/.test(file))
      .map(file => `app/${file}`);

    // 只添加新的文件
    const newIcons = files.filter(file => !jsonData.icons.includes(file));
    if (newIcons.length === 0) {
      console.log("No new icons to add.");
      return;
    }

    jsonData.icons.push(...newIcons);

    // 写回 JSON 文件
    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });
    console.log("Updated app.json successfully.");
  } catch (error) {
    console.error("Error updating app.json:", error);
    process.exit(1);
  }
}

updateJsonFile();
