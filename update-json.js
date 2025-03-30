const fs = require("fs-extra");
const path = require("path");

const jsonFilePath = "app.json";
const iconsDir = "app/";
const repoRawURL = "https://raw.githubusercontent.com/fishdown/Icon/master/app/";

async function updateJsonFile() {
  try {
    let jsonData = await fs.readJson(jsonFilePath).catch(() => ({
      name: "app",
      description: "部分app图标,@fishdown",
      icons: []
    }));

    if (!Array.isArray(jsonData.icons)) {
      jsonData.icons = [];
    }

    // 当前文件夹下的文件
    const currentFiles = fs.readdirSync(iconsDir)
      .filter(file => /\.(png|jpg|jpeg|svg|gif)$/i.test(file));
    const currentFileSet = new Set(currentFiles);

    // 1️⃣ 移除已删除的图片
    jsonData.icons = jsonData.icons.filter(icon => {
      const filename = icon.url.split("/").pop();
      return currentFileSet.has(filename);
    });

    // 2️⃣ 追加新图片
    const existingFilenames = new Set(jsonData.icons.map(icon => icon.url.split("/").pop()));
    for (const file of currentFiles) {
      if (!existingFilenames.has(file)) {
        jsonData.icons.push({
          name: path.basename(file, path.extname(file)),
          url: repoRawURL + file
        });
      }
    }

    // 3️⃣ 确保 loon-icon 和 loon 在前两位
    const loonIconIndex = jsonData.icons.findIndex(icon => icon.name === "loon-icon");
    const loonIndex = jsonData.icons.findIndex(icon => icon.name === "loon");

    const reordered = [];

    if (loonIconIndex !== -1) {
      reordered.push(jsonData.icons.splice(loonIconIndex, 1)[0]);
    }

    if (loonIndex !== -1) {
      // 如果 loon-icon 原来在 loon 前面，它的 index 会减少 1
      const adjustedIndex = loonIconIndex !== -1 && loonIndex > loonIconIndex ? loonIndex - 1 : loonIndex;
      reordered.push(jsonData.icons.splice(adjustedIndex, 1)[0]);
    }

    // 把剩下的 append-only 顺序内容接上
    reordered.push(...jsonData.icons);
    jsonData.icons = reordered;

    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });
    console.log("✅ app.json updated (loon-icon & loon first, others appended).");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateJsonFile();
