const fs = require('fs').promises;
const path = require('path');

const dirname = path.resolve('prisma/generator');
const schemaFile = path.resolve(dirname, './../schema.prisma');

const start = async () => {

  const modelFiles = [
    'user-model',
    'post-model',
    'chat-model',
  ];

  await fs.writeFile(schemaFile, '');
  await fs.appendFile(schemaFile, await fs.readFile(path.resolve(dirname, 'base.prisma'), {encoding: 'utf-8'}));

  await Promise.all(
    modelFiles.map(async (fileName) => {
      const absolutePath = path.resolve(dirname, `./../models/${fileName}.prisma`);
      console.info('Reading Model:', absolutePath);
      const content = await fs.readFile(absolutePath, {encoding: 'utf-8'});
      if (content.length > 0) {
        return await fs.appendFile(schemaFile, content);
      }
      return Promise.resolve();
    }),
  );
};

start();
