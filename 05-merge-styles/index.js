const path = require('path');
const fs = require('fs');
const EOL = require('os').EOL;
const { readdir, readFile, mkdir } = require('fs').promises;

const SRC_FOLDER_NAME = 'styles';
const DEST_FOLDER_NAME = 'project-dist';
const DEST_FILE_NAME = 'bundle.css';
const inputFolder = getAbsPath(SRC_FOLDER_NAME);
const outputPath = getAbsPath(DEST_FOLDER_NAME, DEST_FILE_NAME);

mergeStyles(inputFolder, outputPath);

async function mergeStyles(inputFolder, outputPath) {
  try {
    await mkdir(path.dirname(outputPath), { recursive: true });
    const outputStream = fs.createWriteStream(outputPath);
    outputStream.write('');

    const filesInfo = await readdir(inputFolder, { withFileTypes: true });

    const cssFilesinfo = filesInfo.filter((info) => {
      const hasProperExt = path.extname(info.name) === '.css';
      const isFile = info.isFile();
      return isFile && hasProperExt;
    });

    const contentPromises = [];

    cssFilesinfo.forEach(({ name }) => {
      const fileContent = readFile(path.resolve(inputFolder, name), {
        encoding: 'utf8',
      });
      contentPromises.push(fileContent);
    });

    const contentArr = await Promise.all(contentPromises);
    outputStream.write(contentArr.join(EOL));

    console.log(`Styles successfully combined`);
  } catch (error) {
    console.log(error);
  }
}

function getAbsPath(...args) {
  return path.resolve(__dirname, ...args);
}