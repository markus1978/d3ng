const ghpages = require('gh-pages');

ghpages.publish('dist/app', {
  repo: 'https://github.com/d3ng/d3ng.github.io.git',
  branch: 'master'
}, function(err) {
  console.log(err.toString());
});
