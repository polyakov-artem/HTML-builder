const path = require('path');
const fs = require('fs');
const EOL = require('os').EOL;
const { rm, mkdir, readdir, copyFile, readFile, lstat } = fs.promises;

const config = {
  source: {
    assets: 'assets',
    css: 'styles',
    html: 'template.html',
    htmlParts: 'components',
  },

  output: {
    css: 'style.css',
    html: 'index.html',
    folder: 'project-dist',
  },
};

build();

async function build() {
  await rm(getAbsPath(config.output.folder), { recursive: true, force: true });

  await copyDir(
    getAbsPath(config.source.assets),
    getAbsPath(config.output.folder, config.source.assets)
  );

  await mergeStyles(
    getAbsPath(config.source.css),
    getAbsPath(config.output.folder, config.output.css),
  );

  await generateHTML(
    getAbsPath(config.source.html),
    getAbsPath(config.source.htmlParts),
    getAbsPath(config.output.folder, config.output.html),
  );
}

async function generateHTML(template, partsDir, outputPath) {
  const tempalateContent = await readFile(template, { encoding: 'utf-8' });
  const regexp = /\{\{(\w+?)\}\}/g;

  const reqParts = Array.from(tempalateContent.matchAll(regexp)).map(
    (matchItem) => matchItem[1],
  );

  const reqPartsContent = await Promise.all(
    reqParts.map((part) => {
      try {
        return readFile(path.join(partsDir, part + '.html'), {
          encoding: 'utf-8',
        });
      } catch {
        return Promise.resolve('');
      }
    }),
  );

  const htmlContent = tempalateContent.replace(regexp, (match, partName) => {
    const index = reqParts.indexOf(partName);
    return reqPartsContent[index];
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  fs.createWriteStream(outputPath).write(htmlContent);

  console.log('HTML file successfully generated');
}

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
