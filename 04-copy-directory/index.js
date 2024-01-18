const path = require('path');
const { rm, mkdir, readdir, copyFile } = require('fs').promises;

const SRC_FOLDER = 'files';
const DEST_FOLDER = 'files-copy';
const inputDir = path.resolve(__dirname, SRC_FOLDER);
const outputDir = path.resolve(__dirname, DEST_FOLDER);

copyDir(inputDir, outputDir);

async function copyDir(inputDir, outputDir, { clearOutputDir = true } = {}) {
  if (clearOutputDir) await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const paths = await getCopyPaths(inputDir, outputDir);
  await createDirs(paths.dirs);
  await copyFiles(paths.files);
  console.log(`Folder successfully copied`);
}

async function getCopyPaths(inputDir, outputDir) {
  const paths = { files: [], dirs: [] };

  const list = await readdir(inputDir, {
    recursive: true,
    withFileTypes: true,
  });

  for (let element of list) {
    const source = path.resolve(element.path, element.name);
    const output = source.replace(inputDir, outputDir);

    if (element.isFile()) {
      paths.files.push({ source, output });
    } else {
      paths.dirs.push(output);
    }
  }

  return paths;
}

function createDirs(dirs) {
  const promises = dirs.map((dir) => {
    return mkdir(dir, { recursive: true });
  });

  return Promise.all(promises);
}

function copyFiles(files) {
  const promises = files.map((file) => {
    return copyFile(file.source, file.output);
  });

  return Promise.all(promises);
}