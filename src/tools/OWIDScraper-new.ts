import * as xray from 'x-ray';
import * as get from 'simple-get';
import * as streamToString from 'stream-to-string';
import * as d3 from 'd3';
import * as async from 'async';

const x = xray();

interface OWIDData {
  url: string,
  groups: [{
    title: string,
    url: string,
    pages: [{
      title: string,
      url: string,
      itemRefs: string
    }]
  }]
  items: OWIDItem[]
}

interface OWIDItem {
  description: string,
  metaDataUrl: string,
  dataUrl: string,
  data: any[]
}

let i = 0;

function fetchItem(metaDataUrl: string, callback: (err, item:OWIDItem) => void): void {
  //console.log(`  Fetching item meta data from ${metaDataUrl}.`);
  x(metaDataUrl, '', {
    headers: x('head meta', [{
      name: '@name',
      content: '@content'
    }]),
  }) ((err, content) => {
    let url = metaDataUrl;
    if (url.indexOf("?") != -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    let description = url;
    url += ".csv";
    try {
      description = content.headers.filter(header => header.name == "description")[0].content;
    } catch(exception) {
      console.log(`WARNING: Could not get meta data from ${metaDataUrl}.`);
    }

    // console.log(`  Fetching item data from ${url}.`);
    get(url, (err, res) => {
      if (!err && res.statusCode == 200) {
        streamToString(res).then(body => {
          const data = d3.csv.parse(body);
          callback(null, {
            description: description,
            metaDataUrl: metaDataUrl,
            dataUrl: url,
            data: data
          });
        });
      } else {
        callback(`Could not successfully get data from ${url}.`, null);
      }
    });
  });
}

function fetchData(callback: (err, data: OWIDData) => void): void {
  const url = 'https://ourworldindata.org/';
  const grapherRE = /^https:\/\/ourworldindata.org\/grapher\/([^\/]*)$/;

  console.log(`Fetching structure from ${url}.`);
  x(url, '.owid-data ul li', [{
    title: 'h4',
    pages: x('.link-container a', [{
      title: '',
      url: '@href',
    }])
  }]) ((err, groups) => {
    async.map(groups, (group, callback) => {
      console.log("  " + group.title);
      async.map(group.pages, (page, callback) => {
        console.log("    " + page.url);
        x(page.url, {
          srcURLs: x(['iframe@src'])
        }) ((err, pageContent) => {
          const urls = pageContent.srcURLs.filter(url => url && url.match(grapherRE));
          const result = {
            title: page.title,
            url: page.url,
            itemRefs: urls
          };
          callback(err, result);
        });
      }, (err, pages) => {
        group.pages = pages;
        callback(err, group);
      });
    }, (err, groups) => {
      console.log(`Completed fetching structure from ${url}.`);

      const itemRefs = new Set();
      groups.forEach(group => group.pages.forEach(page => page.itemRefs.forEach(itemRef => itemRefs.add(itemRef))));
      console.log(`Getting data from ${itemRefs.size} items.`);
      async.map(Array.from(itemRefs), fetchItem, (err, items) => {
        const result = {
          url: url,
          groups: groups,
          items: items
        };
        callback(err, result);
      });
    });
  });
}

fetchData((err, data) => {
  if (err) {
    console.log(`Error while fetching data.`);
  } else {
    console.log(`Processing data with ${data.groups.length} groups and ${data.items.length} items.`);
  }
});
