import * as xray from 'x-ray';
import * as get from 'simple-get';
import * as streamToString from 'stream-to-string';
import * as d3 from 'd3';
import * as async from 'async';
import * as fs from 'fs';
import * as JSONStream from 'JSONStream';
import * as ProgressBar from 'progress';

import {OWIDMetaDataNode, OWIDVariableData, OWIDVariableMetaData} from '../app/owid/owid.data';
import {Matrix} from './matrix';

const outPath = "src/assets/owid/";
if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath);
}

const x = xray();

const out = (() => {
  const progressConfig = '[:bar] :current/:total ';
  const progress = new ProgressBar(progressConfig, { total: 10, clear: true, width: 40 });
  return {
    set: (total: number) => {
      progress.total = total;
      progress.curr = 0;
    },
    tick: () => {
      progress.tick();
      progress.render();
    },
    log: progress.interrupt.bind(progress)
  };
})();

interface OWIDDataSet { // a data set, i.e. what can be retrieved from one OWID chart
  key: string;
  description: string;
  metaDataUrl: string;
  dataUrl: string;
  data: any[];
  variableRefs?: string[];
}

interface OWIDRawData {
  dataSetCount: number;
  dataSets: OWIDDataSet[];
  metaData: OWIDMetaDataNode;
}



/**
 * Fetches meta data and data from an individual OWID gapher metaData URI.
 */
function fetchDataSet(dataUrl: string, callback: (err, dataSet: OWIDDataSet) => void): void {
  const metaDataUrl = dataUrl.substring(0, dataUrl.length - 4);
  x(metaDataUrl, '', {
    headers: x('head meta', [{
      name: '@name',
      content: '@content'
    }]),
  }) ((err, content) => {
    let description = dataUrl;
    try {
      description = content.headers.filter(header => header.name == "description")[0].content;
    } catch (exception) {
      out.log(`WARNING: Could not get meta data from ${metaDataUrl}.`);
    }

    get(dataUrl, (err, res) => {
      if (!err && res.statusCode == 200) {
        streamToString(res).then(body => {
          const data = d3.csv.parse(body);
          callback(null, {
            key: dataUrl,
            description: description,
            metaDataUrl: metaDataUrl,
            dataUrl: dataUrl,
            data: data
          });
        });
      } else {
        callback(`ERROR: Could not successfully get data from ${dataUrl}.`, null);
      }
    });
  });
}

/**
 * Fetches all OWIDMetaData from the OWID servers.
 */
function fetchData(callback: (err, data: OWIDRawData) => void): void {
  const url = 'https://ourworldindata.org/';
  const grapherRE = /^https:\/\/ourworldindata.org\/grapher\/([^\/]*)$/;

  out.log(`Fetching structure from ${url}.`);
  x(url, '.owid-data ul li', [{
    title: 'h4',
    pages: x('.link-container a', [{
      title: '',
      url: '@href',
    }])
  }]) ((err, groups) => {
    // groups = [groups[0]]; // only first group when debugging
    async.map(groups, (group, callback) => {
      // out.log("  " + group.title);
      async.map(group.pages, (page, callback) => {
        // out.log("    " + page.url);
        x(page.url, {
          srcURLs: x(['iframe@src'])
        }) ((err, pageContent) => {
          const urls = pageContent.srcURLs.filter(url => url && url.match(grapherRE));
          const result: OWIDMetaDataNode = {
            type: "node",
            key: page.url,
            title: page.title,
            url: page.url,
            dataSetRefs: urls.map(metaDataUrlToDataUrl)
          };
          callback(err, result);
        });
      }, (err, pages) => {
        const result: OWIDMetaDataNode = {
          type: "node",
          key: group.title,
          title: group.title,
          children: pages
        };
        callback(err, result);
      });
    }, (err, groups) => {
      out.log(`Completed fetching structure from ${url}.`);

      const dataSetRefs = new Set();
      groups.forEach(group => group.children.forEach(page => page.dataSetRefs.forEach(dataSetRef => dataSetRefs.add(dataSetRef))));
      out.log(`Getting data from ${dataSetRefs.size} dataSets.`);

      out.set(dataSetRefs.size);
      const mapDataSetRefToDataSet = (dataSetRef, callback) => {
        fetchDataSet(dataSetRef, (err, results) => {
          out.tick();
          callback(err, results);
        });
      };

      async.mapLimit(Array.from(dataSetRefs), 10, mapDataSetRefToDataSet, (err, dataSets) => {
        callback(err, {
          dataSetCount: dataSets.length,
          dataSets: dataSets,
          metaData: {
            type: "node",
            key: "root",
            title: "OWID",
            url: url,
            children: groups,
          }
        });
      });
    });
  });
}

function metaDataUrlToDataUrl(metaDataUrl: string): string {
  let url = metaDataUrl;
  if (metaDataUrl.indexOf("?") != -1) {
    url = metaDataUrl.substring(0, metaDataUrl.indexOf("?"));
  }
  return url + ".csv";
}

/**
 * Tries to find raw OWIDMetaData on the disk. Fetches data from servers if the raw data file does not exist and writes it
 * for the next time.
 */
function fetchDataFromWebOrFile(callback: (data: OWIDRawData) => void): void {
  const rawDataPath = outPath + "/owid_raw.json";

  if (!fs.existsSync(rawDataPath)) {
    fetchData((err, rawData) => {
      if (err) {
        out.log(`Error while fetching data: ${err}. Try to work with data anyways.`);
      }

      out.log(`Writing raw data to ${rawDataPath}.`);
      const dataSets = rawData.dataSets;
      rawData.dataSets = [];
      const stream = JSONStream.stringify();
      stream.pipe(fs.createWriteStream(rawDataPath));
      stream.write(rawData);
      dataSets.forEach(dataSet => stream.write(dataSet));
      stream.end();

      rawData.dataSets = dataSets;
      callback(rawData);
    });
  } else {
    out.log(`Reading raw data from ${rawDataPath}.`);
    const stream = fs.createReadStream(rawDataPath, {encoding: 'utf8'});
    const parser = JSONStream.parse('*');
    stream.pipe(parser);

    let rawData: OWIDRawData = null;
    parser.on('data', data => {
      if (rawData) {
        out.tick();
        rawData.dataSets.push(data as any);
      } else {
        rawData = data as any;
        out.set(rawData.dataSetCount);
      }
    });
    stream.on('end', () => {
      callback(rawData);
    });
  }
}




function transformRawDataSetToVariables(dataSet: OWIDDataSet): {variable: OWIDVariableData; metaData: OWIDVariableMetaData}[] {
  const rawStandardKeys = ['Entity', 'Country code', 'Year'];
  const standardKeys = ['label', 'code', 'year'];

  const matrix = Matrix.from(dataSet.data).project(rawStandardKeys, standardKeys);
  const keys = matrix.columns().filter(key => standardKeys.indexOf(key) == -1);

  return keys.map(key => {
    // compute variable
    const allKeys = standardKeys.slice();
    allKeys.splice(0, 0, key);
    const data = matrix.select(allKeys).project([key], ["value"]).filter(row => row.value && row.value != 0);
    const variable: any = {};
    variable.key = key;
    variable.countries = data.groupBy(["code", "label"], "tmp").array();
    variable.countries.forEach(country => {
      country.tmp = country.tmp.filter(d => d.value && d.value != 0);
      if (country.tmp.length > 0) {
        const yearValueMatrix = Matrix.from(country.tmp).zip();
        country.years = yearValueMatrix.year;
        country.values = yearValueMatrix.value;
      }
      country.tmp = undefined;
    });

    // compute meta data
    const dataByYear = data.groupBy(["year"], "countries").array();
    const metaData: OWIDVariableMetaData = {
      type: "variable",
      key: variable.key,
      title: variable.key,
      description: dataSet.description,
      url: dataSet.metaDataUrl,
      dataUrl: dataSet.dataUrl,
      dataFile: pathFromDataUrl(dataSet.metaDataUrl, keys.indexOf(variable.key)),
      years: dataByYear.map(year => year.year),
      valuesPerYear: dataByYear.map(year => year.countries.length),
      allDataSetRefs: [dataSet.key]
    };

    return {
      variable: variable,
      metaData: metaData
    };
  });
}

// const testRawdataSet: OWIDDataSet = {
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
// logger.out.log(JSON.stringify(transformRawdataSetToVariables(testRawdataSet), null, 2));

function pathFromDataUrl(dataUrl: string, variableIndex: number) {
  const prefixLength = "https://ourworldindata.org/grapher/".length;
  return dataUrl.substr(prefixLength, dataUrl.length) + "-" + variableIndex + ".json";
}

function mergeVariables(existingVariable, newVariable): any {
  // We do not really merge them and rather check out assumption that they are identical anyways.
  let numberOfValues = 0;
  existingVariable.metaData.valuesPerYear.forEach(value => numberOfValues += value);
  newVariable.metaData.valuesPerYear.forEach(value => numberOfValues -= value);
  if (numberOfValues != 0) {
    out.log(`WARNING: Two variables with same key ${existingVariable.metaData.key} have different number of values.`);
  }
  existingVariable.metaData.allDataSetRefs.push(newVariable.metaData.allDataSetRefs[0]);
  return existingVariable;
}

fetchDataFromWebOrFile((rawData: OWIDRawData) => {

  out.log(`Processing raw data from ${rawData.dataSets.length} dataSets.`);
  const allVariables = {};
  out.set(rawData.dataSets.length);

  rawData.dataSets.forEach(dataSet => {
    const variables = transformRawDataSetToVariables(dataSet);
    out.tick();
    dataSet.variableRefs = variables.map(variable => variable.metaData.key);
    variables.forEach(variable => {
      if (!allVariables[variable.variable.key]) {
        allVariables[variable.variable.key] = variable;
      } else {
        allVariables[variable.variable.key] = mergeVariables(allVariables[variable.variable.key], variable);
      }
    });
  });

  out.log(`Add ${Object.keys(allVariables).length} variable's meta data to the meta data tree.`);
  const dataSetMap = {};
  rawData.dataSets.forEach(dataSet => dataSetMap[dataSet.key] = dataSet);
  const visitForVariableMetaData = (node: OWIDMetaDataNode) => {
    if (node.children) {
      node.children.forEach(child => visitForVariableMetaData(child));
    }

    if (node.dataSetRefs) {
      if (!node.children) {
        node.children = [];
      }
      node.dataSetRefs.forEach(dataSetRef => {
        dataSetMap[dataSetRef].variableRefs.forEach(variableRef => node.children.push(allVariables[variableRef].metaData));
      });
    }
  };
  visitForVariableMetaData(rawData.metaData);

  // strip metadata
  out.log("Stripping down empty or redundant meta data nodes.");
  let removedNodes = 0;
  const visitForStripDown: (node: OWIDMetaDataNode) => OWIDMetaDataNode = (node: OWIDMetaDataNode) => {
    if (node.children) {
      const newChildren = [];
      node.children.forEach(child => {
        const newChild = visitForStripDown(child);
        if (newChild) {
          newChildren.push(newChild);
        }
      });
      node.children = newChildren;
    } else {
      return node;
    }

    if (node.children && node.children.length > 0) {
      if (node.children.length == 1) {
        removedNodes++;
        return node.children[0];
      } else {
        return node;
      }
    } else {
      removedNodes++;
      return null;
    }
  };
  visitForStripDown(rawData.metaData);
  out.log(`Removed ${removedNodes} from meta data tree.`);

  // save meta data
  const metaDataFileName = outPath + "/owid_metadata.json";
  out.log(`Write meta data tree to ${metaDataFileName}.`);
  fs.writeFileSync(metaDataFileName, JSON.stringify(rawData.metaData, null, 2));

  // save variable data
  const variableCount = Object.keys(allVariables).length;
  out.log(`Write variable data for ${variableCount} variables to files in ${outPath}.`);
  out.set(variableCount);
  Object.keys(allVariables).forEach(key => {
    const variable = allVariables[key].variable;
    fs.writeFileSync(outPath + "/" + allVariables[key].metaData.dataFile, JSON.stringify(variable, null, 2));
    out.tick();
  });

  console.log("");
});



