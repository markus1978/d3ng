var Xray = require('x-ray');
var x = Xray();
var d3 = require('d3');
var get = require('simple-get');
var toString = require('stream-to-string');
var fs = require('fs');

grapher = /^https:\/\/ourworldindata.org\/grapher\/([^\/]*)$/;

var db = { data: [], meta: [] };
var byCountryCode = {};
var countriesByMetric = {};
var groups = [];

addData = function(datas, source) {
  datas.forEach(function (data) {
    var cc = data['Country code'];
    if (cc) {
      if (cc.match(/OWID_.*/)) {
        cc = cc.substring(5, cc.length);
      }

      var country = byCountryCode[cc];
      if (!country) {
        country = {};
        country.code = cc;
        country.label = data.Entity;
        country.data = [];
        db.data.push(country);
        byCountryCode[cc] = country;
        // console.log("Added country " + cc);
      }

      var year = Number(data.Year);
      if (year == NaN) {
        year = null;
      }
      Object.keys(data).forEach(function(key) {
        if (key != 'Entity' && key != 'Year' && key != 'Country code') {
          var value = data[key];
          var isNumber = !isNaN(value);
          if (isNumber) {
            value = Number(value);
          }

          var metrics = country.data.filter(function(d) { return d.key == key; });
          var metric;
          if (metrics.length > 0) {
            metric = metrics[0];
          } else {
            metric = { key: key, years:[], values:[] }
            country.data.push(metric);

            var meta;
            var metas = db.meta.filter(function (d) {
              return d.key == key;
            });
            if (metas.length == 0) {
              meta = {
                timeSeries: !!year,
                number: isNumber,
                source: source,
                description: source.description,
                key: key,
                label: key
              };
              db.meta.push(meta);
              // console.log("Added data for " + key);
            } else {
              meta = metas[0];
            }

            countries = countriesByMetric[key];
            if (!countries) {
              countries = [];
              countriesByMetric[key] = countries;
              meta.countries = countries;
            }
            if ((!isNumber || value != 0) && countries.indexOf(cc) == -1) {
              countries.push(cc);
            }
          }
          if (year) {
            metric.years.push(year);
          }
          metric.values.push(value);
          if (!year ||year <= 2017) {
            metric.value = value;
          }
        }
      });
    }
  });
};

x('https://ourworldindata.org/', '.owid-data ul li', [{
  title: 'h4',
  links: x('.link-container a', [{
    title: '',
    url: '@href',
  }])
}]) (function (err, items) {
  items.forEach(function(item) {
    console.log(item.title);
    groups.push(item);
    item.links.forEach(function(link) {
      console.log("  " + link.title);
      x(link.url, {
        srcURLs: x(['iframe@src'])
      })(function (err, srcURLs) {
        srcURLs.srcURLs.forEach(function (url) {
          if (url && url.match(grapher)) {
            get(url + ".csv", function (err, res) {
              if (!err && res.statusCode == 200) {
                toString(res).then(function (body) {
                  x(url, 'head meta', [{
                    name: '@name',
                    content: '@content'
                  }])(function (err, headers) {
                    var description = "";
                    headers.forEach(function(header) {
                      if (header.name == "description") {
                        description = header.content;
                      }
                    });
                    var csv = d3.csv.parse(body);
                    addData(csv, {description: description, page: link, csv: url});
                  });
                });
              }
            });
          }
        });
      });
    });
  });
});

function exitHandler(options, err) {
  var json;

  // replace countries with # countries
  db.meta.forEach(function(meta) {
    if (meta.countries) {
      meta.countries = meta.countries.length;
    } else {
      meta.countries = 0;
    }
  });

  // add meta source hierarchy
  var allMeta = [];
  var parentByPage = {};
  groups.forEach(function(group) {
    var meta = {
      label: group.title,
      id: group.title,
      children: []
    }
    group.links.forEach(function(link) {
      parentByPage[link.url] = meta;
    });
    allMeta.push(meta);
  });

  var metaByPage = {};
  db.meta.forEach(function(meta) {
    var pageKey = meta.source.page.url;
    var page = metaByPage[pageKey];
    if (!page) {
      page = {
        label: meta.source.page.title,
        id: pageKey,
        source: pageKey,
        children: []
      };
      metaByPage[pageKey] = page;
      parentByPage[pageKey].children.push(page);
    }
    page.children.push(meta);
    meta.source = meta.source.csv;
  });
  db.meta = allMeta;

  // save all
  // json = JSON.stringify(db, null, 2);
  // fs.writeFileSync('owid.json', json, { encoding: 'utf8'});

  // save 2017
  db.data.forEach(function(country) {
    country.data.forEach(function(data) {
      data.years = undefined;
      data.values = undefined;
    });
  });

  json = JSON.stringify(db, null, 2);
  fs.writeFileSync('src/assets/owid-2017.json', json, { encoding: 'utf8'});

  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

