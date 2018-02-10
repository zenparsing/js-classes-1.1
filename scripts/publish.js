const $ = require('./exec');

require('./build.js');

try {
  $('git checkout gh-pages');
  $('cp dist/index.html ./');
  $('git commit -a -m "Update gh-pages"');
  $('git push');
} catch (e) {
  // Ignore
} finally {
  $('git checkout master');
}
