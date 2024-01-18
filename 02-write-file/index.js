const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { stdin } = process;

const FILE_NAME = 'text.txt';
const EXIT_COMMAND = 'exit';
const EXIT_MESSAGE = 'Goodbye!';

const filePath = path.resolve(__dirname, FILE_NAME);
const greetingText = `Hello! Enter the text and press "Enter" button to save the data to a text file.
To exit press CTRC+C or type ${EXIT_COMMAND}${os.EOL}`;

writeFile();

function writeFile() {
  console.log(greetingText);
  if (!isExists) createFile();

  const writeStream = fs.createWriteStream(filePath, { flags: 'a' });
  const RLInstance = readline.createInterface(stdin);

  RLInstance.on('line', (line) => {
    if (line.trim().toLowerCase() === EXIT_COMMAND.toLowerCase()) {
      exitProgram();
    } else {
      writeStream.write(line + os.EOL);
    }
  });

  process.on('SIGINT', exitProgram);
}

function exitProgram() {
  console.log(os.EOL + EXIT_MESSAGE);
  process.exit();
}

function isExists() {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  });
}

function createFile() {
  fs.writeFile(filePath, '', 'utf-8');
}