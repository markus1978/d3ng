const ghpages = require('gh-pages');

const options = {
  branch: 'master',
  repo: 'git@github.com:d3ng/d3ng.github.io.git'
}
ghpages.publish('dist/app', options, function(err) {
  console.log(err.toString());
});
