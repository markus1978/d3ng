import * as xray from 'x-ray';
import * as get from 'simple-get';
import * as streamToString from 'stream-to-string';
import * as d3 from 'd3';
import * as async from 'async';
import * as fs from 'fs';
import * as status from 'node-status';
import * as JSONStream from 'JSONStream';
import {count} from "rxjs/operator/count";

const x = xray();

interface OWIDData {
  url: string;
  groups: [{
    title: string,
    url: string,
    pages: [{
      title: string,
      url: string,
      itemRefs: string
    }]
  }];
  items: OWIDItem[];
}

interface OWIDItem {
  description: string;
  metaDataUrl: string;
  dataUrl: string;
  data: any[];
}

interface OWIDVariable {
  key: string;
  description: string;
  metaDataUrl: string;
  dataUrl: string;
  dataFile: string;
  timeSeries: boolean;
  numberOfCountries: number;
  years: number[];
  valuesPerYear: number[];
}

interface OWIDDatum {
  code: string;
  label: string;
  years: number[];
  values: number[];
}

/**
 * Fetches meta data and data from an individual OWID gapher metaData URI.
 */
function fetchItem(metaDataUrl: string, callback: (err, item: OWIDItem) => void): void {
  // console.log(`  Fetching item meta data from ${metaDataUrl}.`);
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
    } catch (exception) {
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

/**
 * Fetches all OWIDData from the OWID servers.
 */
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
      const itemsStatus = status.addItem('items', { max: itemRefs.size });
      status.start();
      async.mapLimit(Array.from(itemRefs), 10,
        (itemRef, callback) => {
          fetchItem(itemRef, (err, results) => {
            itemsStatus.inc();
            callback(err, results);
          });
        }, (err, items) => {
          status.stop();
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

/**
 * Tries to find raw OWIDData on the disk. Fetches data from servers if the raw data file does not exist and writes it
 * for the next time.
 */
function fetchDataFromWebOrFile(callback: (data: OWIDData) => void): void {
  const rawDataPath = "src/assets/owid_raw.json";

  if (!fs.existsSync(rawDataPath)) {
    fetchData((err, rawData) => {
      if (err) {
        console.log(`Error while fetching data: ${err}. Try to work with data anyways.`);
      }

      console.log(`Writing raw data to file.`);
      const items = rawData.items;
      rawData.items = [];
      const stream = JSONStream.stringify();
      stream.pipe(fs.createWriteStream(rawDataPath));
      stream.write(rawData);
      items.forEach(item => stream.write(item));
      stream.end();

      callback(rawData);
    });
  } else {
    console.log(`Reading raw data from file.`);
    const stream = fs.createReadStream(rawDataPath, {encoding: 'utf8'});
    const parser = JSONStream.parse('*');
    stream.pipe(parser);

    const itemStatus = status.addItem('items');
    status.start();
    let rawData: OWIDData = null;
    parser.on('data', data => {
      if (rawData) {
        itemStatus.inc();
        rawData.items.push(data as any);
      } else {
        rawData = data as any;
      }
    });
    stream.on('end', () => {
      status.stop();
      callback(rawData);
    });
  }
}

fetchDataFromWebOrFile(rawData => {
  console.log(`Processing raw data from ${rawData.items.length} items.`);
  const standardKeys = ['Entity', 'Country code', 'Year'];
  rawData.items.forEach(item => {
    const firstDatum = item.data[0];
    const keys = Object.keys(firstDatum).filter(key => standardKeys.indexOf(key) == -1);
    const timeSeries = firstDatum.hasKey('Year');

    if (timeSeries) {
      const variables: any = keys.map(key => {
        const data: any[] = item.data.select(standardKeys.join([key])).replace(key, "value");
        const variable: any = {};
        variable.key = key;
        variable.countries = data.groupBy(["code", "label"], "tmp");
        variable.countries.forEach(country => {
          const yearValueMatrix = country.tmp.filter(d => d.value && d.value != 0).matrix();
          country.tmp = undefined;
          country.years = yearValueMatrix.years;
          country.values = yearValueMatrix.value;
        })
        return variable;
      }).toObject("key");
    } else {
      console.log(`WARNING: Non time series data at ${item.dataUrl}.`);
    }
  });
});

declare global {
  interface Array<T> {
    select<R>(keys: string[]): R[];
    replace<R>(from: string, to: string): R[];
    groupBy<R>(keys: string[], groupedKey: string): R[];
    matrix(): any;
    toObject(key: string): any;
    join(other: T[]): T[];
  }
}
