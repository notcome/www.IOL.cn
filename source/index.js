"use strict";

var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var Directory = require('./Directory');


function generate (dir) {
  dir.makeDestDir();

  let {files, dirs} = dir.readdirAndSort();

  let isTerminal = files.reduce(
    (previous, current) => previous || path.basename(current.path) == 'terminal',
    false);

  let reducer = (previous, current) => {
    previous[current.key] = current.value;
    return previous;
  }

  if (isTerminal) {
    _.map(dirs, dir => dir.makeDestDir());
    return {
      key: path.basename(dir.path),
      value: _.reduce(_.map(dirs, compileTerminal), reducer, {})
    };
  }

  return {
    key: path.basename(dir.path),
    value: _.reduce(_.map(dirs, generate), reducer, {})
  };
}

function compileTerminal (dir) {
  let {files} = dir.readdirAndSort();

  console.log('compiling', dir.path);
  
  let context = plugins.reduce((context, plugin) => plugin(context, files), {});

  return {
    key: path.basename(dir.path),
    value: _.pick(context, 'title', 'author', 'tags')
  };
}

function newTempPath () {
  var prefix = 'ac.yan.cn.ol';
  var random = Math.random().toString().slice(3);
  var tmpPath = '/tmp/' + prefix + random;
  if (fs.existsSync(tmpPath))
    return newTempPath();
  return tmpPath;
}

function startCompile (src, dest) {
  var tmpPath = newTempPath();
  var toc = generate(new Directory('/Users/LiuMS/Desktop/iol', tmpPath)).value;
  console.log(JSON.stringify(toc, null, 2));

  var gravePath = newTempPath();
  if (fs.existsSync(dest))
    fs.renameSync(dest, gravePath);

  fs.renameSync(tmpPath, dest);
}

var templates = require('./TemplateManager')('/Users/LiuMS/GitHub/OL.cn/layouts');
var plugins = require('./plugins')(templates);

startCompile(
  '/Users/LiuMS/GitHub/OL.cn/documents/problems',
  '/Users/LiuMS/output/problems');