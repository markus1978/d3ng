import * as xray from 'x-ray';
import * as get from 'simple-get';
import * as streamToString from 'stream-to-string';
import * as d3 from 'd3';
import * as async from 'async';
import * as fs from 'fs';
import * as status from 'node-status';
import * as JSONStream from 'JSONStream';

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

interface OWIDVariableMetaData {
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

interface OWIDVariable {
  key: string;
  countries: [{
    code: string;
    label: string;
    years: number[];
    values: number[];
  }];
}

/**
 * Fetches meta data and data from an individual OWID gapher metaData URI.
 */
function fetchItem(metaDataUrl: string, callback: (err, item: OWIDItem) => void): void {
  // logger.log(`  Fetching item meta data from ${metaDataUrl}.`);
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
      logger.log(`WARNING: Could not get meta data from ${metaDataUrl}.`);
    }

    // logger.log(`  Fetching item data from ${url}.`);
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

  logger.log(`Fetching structure from ${url}.`);
  x(url, '.owid-data ul li', [{
    title: 'h4',
    pages: x('.link-container a', [{
      title: '',
      url: '@href',
    }])
  }]) ((err, groups) => {
    async.map(groups, (group, callback) => {
      logger.log("  " + group.title);
      async.map(group.pages, (page, callback) => {
        logger.log("    " + page.url);
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
      logger.log(`Completed fetching structure from ${url}.`);

      const itemRefs = new Set();
      groups.forEach(group => group.pages.forEach(page => page.itemRefs.forEach(itemRef => itemRefs.add(itemRef))));
      logger.log(`Getting data from ${itemRefs.size} items.`);
      async.mapLimit(Array.from(itemRefs), 10,
        (itemRef, callback) => {
          fetchItem(itemRef, (err, results) => {
            fetchingStatus.inc();
            callback(err, results);
          });
        }, (err, items) => {
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
        logger.log(`Error while fetching data: ${err}. Try to work with data anyways.`);
      }

      logger.log(`Writing raw data to file.`);
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
    logger.log(`Reading raw data from file.`);
    const stream = fs.createReadStream(rawDataPath, {encoding: 'utf8'});
    const parser = JSONStream.parse('*');
    stream.pipe(parser);

    let rawData: OWIDData = null;
    parser.on('data', data => {
      if (rawData) {
        loadingStatus.inc();
        rawData.items.push(data as any);
      } else {
        rawData = data as any;
      }
    });
    stream.on('end', () => {
      callback(rawData);
    });
  }
}

class Matrix {

  private arr: any[];

  static from(arr: any[]): Matrix {
    if (!arr || arr.length == 0) {
      throw new Error("Matrix must not be empty.");
    }
    const result = new Matrix();
    result.arr = arr;
    return result;
  }

  select(keys: string[]): Matrix {
    const result = this.arr.map(source => {
      const target = {};
      keys.forEach(key => target[key] = source[key]);
      return target;
    });
    return Matrix.from(result);
  }

  public project(fromKeys: string[], toKeys: string[]): Matrix {
    fromKeys = fromKeys.slice(0);
    toKeys = toKeys.slice(0);
    Object.keys(this.arr[0]).filter(key => fromKeys.indexOf(key) == -1).forEach(key => {
      fromKeys.push(key);
      toKeys.push(key);
    });
    const result = this.arr.map(source => {
      const target = {};
      for( let i = 0; i < fromKeys.length; i++) {
        target[toKeys[i]] = source[fromKeys[i]];
      }
      return target;
    });
    return Matrix.from(result);
  }

  groupBy(keys: string[], groupedKey: string): Matrix {
    const keyKey = keys[0];
    const groupDict = [];
    const groups = [];
    this.arr.forEach(element => {
      const key = element[keyKey];
      let group = groupDict[key];
      if (!group) {
        group = {};
        group[groupedKey] = [];
        Object.keys(element)
          .filter(key => keys.indexOf(key) != -1)
          .forEach(key => group[key] = element[key]);
        groupDict[key] = group;
        groups.push(group);
      }

      const groupElement = {};
      Object.keys(element)
        .filter(key => keys.indexOf(key) == -1)
        .forEach(key => groupElement[key] = element[key]);
      group[groupedKey].push(groupElement);
    });
    return Matrix.from(groups);
  }

  zip(): any {
    const result = {};
    const keys = Object.keys(this.arr[0]);
    keys.forEach(key => result[key] = []);
    this.arr.forEach(element => keys.forEach(key => result[key].push(element[key])));
    return result;
  }

  rows(): string[] {
    return Object.keys(this.arr[0]);
  }

  array(): any[] {
    return this.arr;
  }
}


function transformRawItemToVariables(item: OWIDItem): OWIDVariable[] {
  const rawStandardKeys = ['Entity', 'Country code', 'Year'];
  const standardKeys = ['label', 'code', 'year'];

  const matrix = Matrix.from(item.data).project(rawStandardKeys, standardKeys);
  const keys = matrix.rows().filter(key => standardKeys.indexOf(key) == -1);

  const variables = keys.map(key => {
    const allKeys = standardKeys.slice();
    allKeys.splice(0,0, key);
    const data = matrix.select(allKeys).project([key], ["value"]);
    const variable: any = {};
    variable.key = key;
    variable.countries = data.groupBy(["code", "label"], "tmp").array();
    variable.countries.forEach(country => {
      country.tmp = country.tmp.filter(d => d.value && d.value != 0);
      if (country.tmp.length > 0) {
        const yearValueMatrix = Matrix.from(country.tmp.filter(d => d.value && d.value != 0)).zip();
        country.years = yearValueMatrix.year;
        country.values = yearValueMatrix.value;
      }
      country.tmp = undefined;
    });
    return variable;
  });

  return variables;
}

// const testRawItem: OWIDItem = {
//   description: "test",
//   metaDataUrl: "mdu",
//   dataUrl: "du",
//   data: [
//     {
//       'Entity': 'USA',
//       'Country code': 'US',
//       'Year': 2006,
//       'Somekey1': 0,
//       'Somekey2': 0.1
//     },
//     {
//       'Entity': 'USA',
//       'Country code': 'US',
//       'Year': 2007,
//       'Somekey1': 0.23,
//       'Somekey2': 0.1
//     },
//     {
//       'Entity': 'USA',
//       'Country code': 'US',
//       'Year': 2008,
//       'Somekey1': 0.46,
//       'Somekey2': 0.2
//     },
//     {
//       'Entity': 'Fra',
//       'Country code': 'fr',
//       'Year': 2006,
//       'Somekey1': 0,
//       'Somekey2': 0.1
//     },
//     {
//       'Entity': 'Fra',
//       'Country code': 'fr',
//       'Year': 2007,
//       'Somekey1': 0.23,
//       'Somekey2': 0.1
//     },
//     {
//       'Entity': 'Fra',
//       'Country code': 'fr',
//       'Year': 2008,
//       'Somekey1': 0.46,
//       'Somekey2': 0.2
//     },
//   ]
// };
//
// logger.log(JSON.stringify(transformRawItemToVariables(testRawItem), null, 2));

const loadingStatus = status.addItem('loading');
const fetchingStatus = status.addItem('fetching');
const processingStatus = status.addItem('processing');

const logger = status.console();

status.start({
 interval: 100,
 pattern: ' Doing work: {uptime}  |  {spinner.cyan}  |  featched: {fetching} | loaded: {loading} | processed: {processing}'
});

function pathFromDataUrl(dataUrl: string, variableIndex: number) {
  const prefixLength = "https://ourworldindata.org/grapher/".length;
  return dataUrl.substr(prefixLength, dataUrl.length) + "-" + variableIndex + ".json";
}

fetchDataFromWebOrFile(rawData => {
  logger.log(`Processing raw data from ${rawData.items.length} items.`);

  rawData.items.forEach(item => {
    if (item.data[0]['Year']) {
      const variables = transformRawItemToVariables(item);
      let index = 0;
      variables.forEach(variable => {
        logger.log(pathFromDataUrl(item.dataUrl, index++));
      });
      processingStatus.inc();
    }
  });

  status.stop();
});



