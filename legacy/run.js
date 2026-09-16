const downImg = require('./index.js'),
  imgs = require('../test/index.json');
imgs.forEach(url =>
  downImg(
    {
      url,
    },
    {}
  )
);
