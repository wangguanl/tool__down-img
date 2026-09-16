const FS = require('fs'),
  request = require('request');

module.exports = (opts, path) => {
  request
    .get(opts)
    .on('response', async res => {
      // console.log(res.headers['content-type']);
      // path += '.' + res.headers['content-type'].split('/')[1];
      /* res
              .pipe(FS.createWriteStream(path))
              .on('error', e => {
                console.log('pipe error', e);
                reject([e, path]);
              })
              .on('finish', () => {
                resolve(path);
              })
              .on('close', () => {}); */
    })
    .pipe(FS.createWriteStream(path))
    .on('error', e => {
      console.log('pipe error', e);
      reject([e, path]);
    })
    .on('finish', () => {
      resolve(path);
    })
    .on('close', () => {});
};
