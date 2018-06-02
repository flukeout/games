const fs = require('fs');
const path = require('path');
const ncp = require('ncp');

const sourcePath = path.resolve('../battle-pong/build');
const destPath = path.resolve('./app/');

fs.mkdir(destPath, err => {
  let filesToCopy = [
    'matter.min.js',
    'game.min.js',
    'rules.min.js',
    'story.min.js',
    'splash.min.js',
    'index.html',
    'game.html',
    'rules.html',
    'splash.html',
    'style.css',
    'assets',
    'fonts',
    'sounds',
    'music'
  ].map(source => { return {"from": path.resolve(sourcePath, source), "to": path.resolve(destPath, source)} });

  filesToCopy.push({
    from: './build/index.js',
    to: './app/index.js'
  });

  filesToCopy.forEach(fileToCopy => {
    ncp(fileToCopy.from, fileToCopy.to, err => {
      if (err) console.error('Couldn\'t copy ' + sourcePath + fileToCopy.from, err);
    });
  });
});


