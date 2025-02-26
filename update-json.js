const fs = require("fs-extra");
const path = require("path");

const jsonFilePath = "app.json";
const iconsDir = "app/";
const repoRawURL = "https://raw.githubusercontent.com/fishdown/Icon/master/app/";

async function updateJsonFile() {
  try {
    // 读取 JSON 文件（如果不存在，则初始化为空数组）
    let jsonData = await fs.readJson(jsonFilePath).catch(() => []);

    // 确保 JSON 数据是数组
    if (!Array.isArray(jsonData)) {
      console.error("Error: app.json format is incorrect. Expected an array.");
      return;
    }

    // 获取 app 目录下的所有图片文件
    const files = fs.readdirSync(iconsDir).filter(file => /\.(png|jpg|jpeg|svg|gif)$/.test(file));

    // 处理新文件，转换成 { name, url } 格式
    const newIcons = files.map(file => ({
      name: path.basename(file, path.extname(file)), // 去掉扩展名
      url: repoRawURL + file
    }));

    // 过滤出未添加过的图标
    const existingUrls = new Set(jsonData.map(item => item.url));
    const iconsToAdd = newIcons.filter(icon => !existingUrls.has(icon.url));

    if (iconsToAdd.length === 0) {
      console.log("No new icons to add.");
      return;
    }

    // 更新 JSON 数据
    jsonData.push(...iconsToAdd);

    // 写回 JSON 文件
    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });
    console.log("Updated app.json successfully.");
  } catch (error) {
    console.error("Error updating app.json:", error);
    process.exit(1);
  }
}

updateJsonFile();
