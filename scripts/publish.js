const $ = require('./exec');

require('./build.js');

$('git checkout gh-pages');

try {
  $('cp dist/index.html ./');
  $('git commit -a -m "Update gh-pages"');
  $('git push');
} finally {
  $('git checkout master');
}
