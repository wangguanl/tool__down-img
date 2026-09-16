const Path = require('path'),
  { statAsync, mkdirAsync, accessAsync } = require('./utils/node-utils'),
  { to } = require('await-to-js'),
  downImg = require('./down-img');

/**
 * 下载网络图片
 * @param {object} opts
 */
module.exports = (opts = {}, { output = './dist', prefix = '', name = '' }) =>
  new Promise(async (resolve, reject) => {
    // 检查输出目录是否存在
    const [statOutputErr] = await to(statAsync(output));
    statOutputErr && (await to(mkdirAsync(output)));

    name =
      (prefix ? prefix + '-' : '') +
      (name || new URL(opts.url).pathname.slice(1).replace(/\//g, '-'));

    if (!Path.extname(name)) {
      name += '.png';
    }
    const path = Path.resolve(output, name);
    // 检查文件是否存在
    const [accessPathErr] = await to(accessAsync(path));
    if (!accessPathErr) {
      console.log('文件已存在：' + path);
      resolve(path);
      return;
    }
    downImg(opts, path);
  });
