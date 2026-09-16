const FS = require('fs'),
  { to } = require('await-to-js');

module.exports = {
  // 读取文件夹
  readdirAsync: path =>
    new Promise((resolve, reject) =>
      FS.readdir(path, (err, dirs) => (err ? reject(err) : resolve(dirs)))
    ),
  // 读取文件
  readFileAsync: path =>
    new Promise((resolve, reject) =>
      FS.readFile(path, (err, buffer) => (err ? reject(err) : resolve(buffer)))
    ),
  // 写入文件
  writeFileAsync: (path, data) =>
    new Promise((resolve, reject) =>
      FS.writeFile(path, data, err => (err ? reject(err) : resolve()))
    ),
  // 检查文件夹是否存在
  statAsync: path =>
    new Promise((resolve, reject) =>
      FS.stat(path, (err, data) => (err ? reject(err) : resolve(data)))
    ),
  // 创建文件夹
  mkdirAsync: path =>
    new Promise((resolve, reject) =>
      FS.mkdir(path, err => (err ? reject(err) : resolve()))
    ),
  // 检查文件是否存在
  accessAsync: path =>
    new Promise((resolve, reject) =>
      FS.access(path, err => (err ? reject(err) : resolve()))
    ),
  // 检查数据是否是一个文件
  isFile: path =>
    new Promise(async (resolve, reject) => {
      const [err, data] = await to(module.exports.statAsync(path));
      err ? reject(err) : resolve(data.isFile());
    }),
  // 检查数据是否是一个文件夹
  isDirectory: path =>
    new Promise(async (resolve, reject) => {
      const [err, data] = await to(module.exports.statAsync(path));
      err ? reject(err) : resolve(data.isDirectory());
    }),
  // 检查数据是否是一个文件夹
  rmdirSync: async path =>
    new Promise(async (resolve, reject) =>
      FS.rmdir(path, err => (err ? reject(err) : resolve()))
    ),
  // 递归删除文件夹及文件
  rmDirFile: path =>
    new Promise(async (resolve, reject) => {
      if (FS.existsSync(path)) {
        const [err, files] = await to(module.exports.readdirAsync(path));
        await Promise.allSettled(
          files.map(
            file =>
              new Promise(async (resolve, reject) => {
                let curPath = path + '/' + file;
                //判断是否是文件夹
                if (FS.statSync(curPath).isDirectory()) {
                  await module.exports.rmDirFile(curPath); //递归删除文件夹
                } else {
                  //是文件的话说明是最后一层不需要递归
                  FS.unlinkSync(curPath); //删除文件
                }
                resolve();
              })
          )
        );
        await module.exports.rmdirSync(path);
        resolve();
      }
    }),
};
