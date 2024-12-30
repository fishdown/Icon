const fs = require("fs");
const path = require("path");

// 定义文件夹和 JSON 文件路径
const imagesDir = path.join(__dirname, "../../app");
const jsonFilePath = path.join(__dirname, "../../app.json");

// 初始化空的 JSON 数据
let jsonData = { icon: [] };

// 如果 JSON 文件存在，读取其内容（避免覆盖其他字段）
if (fs.existsSync(jsonFilePath)) {
  const existingData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
  // 保留其他字段，但重置 icon 数组
  jsonData = { ...existingData, icon: [] };
}

// 扫描图片文件夹
const images = fs.readdirSync(imagesDir).filter((file) => {
  const ext = path.extname(file).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".svg"].includes(ext); // 仅处理支持的图片格式
});

// 生成新的 icon 列表
const newIcons = images.map((image) => ({
  name: path.basename(image, path.extname(image)), // 图片名称（去掉扩展名）
  path: `app/${image}`, // 图片相对路径
}));

// 更新 JSON 数据
jsonData.icon = newIcons;

// 写入到 JSON 文件
fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), "utf8");

console.log("app.json 已重置并更新成功！");
