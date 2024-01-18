const fs = require('fs');
const path = require('path');
const { readdir, stat } = fs.promises;

const FOLDER_NAME = 'secret-folder';
const folderPath = path.resolve(__dirname, FOLDER_NAME);

getFilesInfo(folderPath);

async function getFilesInfo(folderPath) {
  const elements = await readdir(folderPath, { withFileTypes: true });
  const files = elements.filter((item) => item.isFile());

  const promises = files.map(async (file) => {
    const filePath = path.resolve(file.path, file.name);
    const name = path.parse(file.name).name;
    const ext = path.extname(filePath).slice(1);
    const size = (await stat(filePath)).size;
    const sizeInKb = +(size / 1024).toFixed(2) + 'kb';

    return {
      name,
      ext,
      sizeInKb,
    };
  });

  const info = await Promise.all(promises);

  info.forEach((fileInfo) => {
    console.log(`${fileInfo.name} - ${fileInfo.ext} - ${fileInfo.sizeInKb}`);
  });
}
