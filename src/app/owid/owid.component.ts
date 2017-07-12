import {Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngParallelCoordinatesComponent} from "../../lib/d3ng-parallel-coordinates.component";
import {D3ngCollapsibleIndentedTreeComponent} from "../../lib/d3ng-collapsible-indented-tree.component";
import * as d3 from "d3";
import {D3ngGroupContext} from "../../lib/d3ng-groups.component";
import {D3ngMapComponent} from "../../lib/d3ng-map.component";
import {Observable} from "rxjs/Observable";
import {OWIDMetaDataNode, OWIDVariableMetaData, treeForEach} from "./owid.data";
import {Matrix} from "../../tools/matrix";
import {D3ngHistogramComponent} from "../../lib/d3ng-histogram.component";
import { isDevMode } from '@angular/core';
import {Path, Point} from "../../lib/d3ng-path-plot.component";

@Component({
  selector: 'app-owid',
  templateUrl: './owid.component.html',
  styleUrls: ['./owid.component.css']
})
export class OwidComponent implements OnInit {

  private static defaultTimeExtent = { min: 1000, minLabel: "1000 AD", max: 2200, maxLabel: "2200 AD" };

  // The group context that controls the data flow between charts and  chart groups.
  context = new D3ngGroupContext();
  // The root nodes of the meta data tree.
  metaDataRoots: OWIDMetaDataNode[] = [];
  originalMetaDataRoots: OWIDMetaDataNode[] = [];

  // The list of user selected variables.
  _selectedVariables: OWIDVariableMetaData[] = [];
  set selectedVariables(value: OWIDVariableMetaData[]) {
    this._selectedVariables = value;
    this.onSelectedVariablesChanged();
  }
  get selectedVariables(): OWIDVariableMetaData[] {
    return this._selectedVariables;
  }

  devMode = isDevMode();

  private initialSelectionAndConfigInitialized = false;
  initialSelectionAndConfig = {
    "year": 2011,
    "variables": [
      {
        "key": "CO2 emissions per capita by nation- CDIAC",
        "scale": 0.2790816472336535,
        "direction": 1
      },
      {
        "key": "GDP per capita PPP 2011 – WDI",
        "scale": 0.401877572016461,
        "direction": 1
      },
      {
        "key": "Total population (Gapminder)",
        "scale": 0.19380669946781492,
        "direction": 1
      },
      {
        "key": "Cumulative CO2 by nation- CDIAC",
        "scale": 0.19380669946781492,
        "direction": 1
      },
      {
        "key": "CO2 annual emissions by nation-CDIAC",
        "scale": 0.19380669946781495,
        "direction": 1
      },
      {
        "key": "CO2 intensity- (kgCO2/2011-$ PPP)- World Bank",
        "scale": 0.6944444444444445,
        "direction": 1
      },
      {
        "key": "Human Development Index (HDI), 1980-2014 - UN",
        "scale": 1.728,
        "direction": 1
      },
    ],
    "countries": [
      "SVK",
      "ROU",
      "HUN",
      "POL",
      "CZE",
      "GRC",
      "TUR",
      "EGY",
      "LBY",
      "TUN",
      "DZA",
      "MAR",
      "CHN",
      "NZL",
      "IND",
      "MEX",
      "ARG",
      "CHL",
      "BRA",
      "ZAF",
      "DNK",
      "BEL",
      "NLD",
      "IRL",
      "ISL",
      "PRT",
      "GBR",
      "AUT",
      "ITA",
      "KOR",
      "JPN",
      "AUS",
      "NOR",
      "SWE",
      "ESP",
      "FRA",
      "DEU",
      "RUS",
      "CAN",
      "USA"
    ]
  };

  tsHistogramData: {category: string, x: number, value: number}[] = [];
  timeExtent: {min: number, max: number, minLabel: string, maxLabel: string} = OwidComponent.defaultTimeExtent;

  _selectedYear = null;
  set selectedYear(value: number) {
    this._selectedYear = value;
    this.updateCountryData();
  }
  get selectedYear(): number {
    return this._selectedYear;
  }

  countryData = [];
  countryDataDimensions: string[] = [];
  private countryDataCache = {};

  // The list of selected countries as list of data objects.
  private _selectedCountries = []
  set selectedCountries(value: any[]) {
    this._selectedCountries = value;
    this.context.applyFilter(selected => this._selectedCountries.indexOf(selected) != -1);
  }
  get selectedCountries(): any[] {
    return this._selectedCountries;
  }

  @ViewChild('metaHistogram') variableHistogram: D3ngHistogramComponent;
  @ViewChild('meta') variableTreeElement: D3ngCollapsibleIndentedTreeComponent;
  @ViewChild('pc') pc: D3ngParallelCoordinatesComponent;
  @ViewChild('map') map: D3ngMapComponent;

  private static trunc(str: string, n: number): string {
    return (str.length > n) ? str.substr(0, n - 1) + '..' : str;
  }

  selectionToJSON(selectedYear, selectedVariables, selectedCountries): string {
    try {
      const selection: any = {
        year: selectedYear,
        variables: selectedVariables.map(variable => {
          const config = this.pc.dimensionConfigurations.find(dim => dim.key == variable.key);
          if (config) {
            return config;
          } else {
            return {key: variable.key};
          }
        }),
        countries: selectedCountries.map(country => country.code),
      };
      return JSON.stringify(selection, null, 2);
    } catch (nop) {
      return "Could not collect JSON data.";
    }
  }

  constructor(private http: Http) {
    this._selectedYear = this.initialSelectionAndConfig.year;
    this.http.get('/assets/owid/owid_metadata.json')
      .map((res: Response) => res.json())
      .subscribe((res: OWIDMetaDataNode) => {
        this.metaDataRoots = [res];
        this.originalMetaDataRoots = [res];
        const selectedVariables: OWIDVariableMetaData[] = [];
        treeForEach(res, ((node: OWIDMetaDataNode) => {
          if (this.initialSelectionAndConfig.variables.find(variable => node.key == variable.key)) {
            if (!selectedVariables.find(variable => variable.key == node.key)) {
              selectedVariables.push(node as OWIDVariableMetaData);
            }
          }
        }));
        this.selectedVariables = this.initialSelectionAndConfig.variables
          .map(initsc => selectedVariables.find(v => v.key == initsc.key))
          .filter(variable => variable);
      });
  }

  onSelectedVariablesChanged(): void {
    // update time series histogram data
    let minYear = Number.MIN_SAFE_INTEGER;
    let maxYear = Number.MAX_SAFE_INTEGER;
    if (this.selectedVariables.length == 0) {
      this.tsHistogramData = [];
      this.timeExtent = OwidComponent.defaultTimeExtent;
    } else {
      this.tsHistogramData = Matrix.from(this.selectedVariables)
        .unzip(['years', 'valuesPerYear'])
        .array().map(row => {
          minYear = Math.max(minYear, row.years);
          maxYear = Math.min(maxYear, row.years);
          return {
            category: row.key,
            x: Number(row.years),
            value: Number(row.valuesPerYear)
          };
        });
      // update time extent data
      this.timeExtent = {
        max: maxYear,
        min: minYear,
        minLabel: minYear < 0 ? `${-minYear} BC` : `${minYear} AD`,
        maxLabel: `${maxYear} AD`
      };
    }

    // update the choropleth dimension
    if (!this.selectedVariables.find(variable => variable.key == this.map.choropleth)) {
      if (this.selectedVariables.length > 0) {
        this.map.choropleth = this.selectedVariables[0].key;
      } else {
        this.map.choropleth = null;
      }
    }

    this.updateCountryData(() => {
      this.countryDataDimensions = this.selectedVariables.map(variable => variable.key);

      // apply the initial selection and configuration (if it still applies)
      if (!this.initialSelectionAndConfigInitialized) {
        this.initialSelectionAndConfigInitialized = true;
        this.pc.dimensionConfigurations = this.initialSelectionAndConfig.variables;
        const selectedCountries = this.countryData.filter(country => this.initialSelectionAndConfig.countries.indexOf(country.code) != -1);
        this.pc.preDirectSelection = selectedCountries;
      }
    });
  }

  private loadVariableData(variables: OWIDVariableMetaData[], callback: () => void) {
    const notYetLoadedVariables = variables.filter(variable => !this.countryDataCache[variable.key]);
    const requests = notYetLoadedVariables.map(variable => this.http.get("/assets/owid/" + variable.dataFile).map(res => {
      return {
        metaData: variable,
        variable: res.json()
      };
    }));
    if (requests.length > 0) {
      Observable.forkJoin(requests).subscribe(results => {
        results.forEach(result => this.countryDataCache[result.metaData.key] = result);
        callback();
      });
    } else {
      callback();
    }
  }

  private updateCountryData(callback?) {
    this.loadVariableData(this.selectedVariables, () => {
      const countryMap = {};
      this.selectedVariables.forEach(variableMetaData => {
        const variable = this.countryDataCache[variableMetaData.key].variable;

        let selectedDataYear = Number.MIN_SAFE_INTEGER;
        variableMetaData.years.forEach(year => {
          if (year <= this.selectedYear && year > selectedDataYear) {
            selectedDataYear = year;
          }
        });
        variable.countries.forEach(country => {
          let value = undefined;
          let yearIndex = 0;
          for (; yearIndex < country.years.length; yearIndex++) {
            if (country.years[yearIndex] == selectedDataYear) {
              value = country.values[yearIndex];
              break;
            }
          }

          let countryData = countryMap[country.code];
          if (!countryData && value) {
            const existingCountry = this.countryData.find(existingCountry => existingCountry.code == country.code);
            if (existingCountry) {
              countryData = existingCountry;
            } else {
              countryData = {
                code: country.code,
                label: country.label
              };
            }
            countryMap[country.code] = countryData;
          }
          if (countryData) {
            countryData[variableMetaData.key] = value;
          }
        });
      });
      this.countryData = Object.keys(countryMap).map(key => countryMap[key]);
      if (callback) {
        callback();
      }
    });
  }

  private getMetaDataForVariableKey(variableKey: string): OWIDVariableMetaData {
    return this.countryDataCache[variableKey].metaData;
  }

  onVariableHistogramSelectionChanged(selectedVariables: OWIDVariableMetaData[]): void {
    // compute meta data tree copy with the histogram and tree selected variables
    if (selectedVariables.length == 0) {
      this.metaDataRoots = this.originalMetaDataRoots;
    } else {
      const targetMetaDataRoots = [];
      const visit = (source: OWIDMetaDataNode, targetArray: OWIDMetaDataNode[]) => {
        if (source.type == "variable") {
          if (selectedVariables.indexOf(source as OWIDVariableMetaData) != -1 ||
            this.selectedVariables.indexOf(source as OWIDVariableMetaData) != -1) {
            targetArray.push(source);
          }
        } else {
          const target: any = {
            type: source.type,
            key: source.key,
            title: source.title,
            url: source.url
          };

          if (source.children) {
            target.children = [];
            source.children.forEach(child => visit(child, target.children));
          }

          targetArray.push(target);
        }
      };
      this.originalMetaDataRoots.forEach(root => visit(root, targetMetaDataRoots));
      this.metaDataRoots = targetMetaDataRoots;
    }
  }

  ngOnInit() {
    this.variableHistogram.value = variable => d3.max(variable.valuesPerYear);

    this.variableTreeElement.customLabel = (item: OWIDMetaDataNode) => {
      if (item.children) { // can't be a variable
        return item.title;
      } else { // has to be a variable
        return `(${d3.max((item as OWIDVariableMetaData).valuesPerYear)}) ${item.title}`;
      }
    };

    this.variableTreeElement.customizeEntrySpan = (span) => {
      span = span.filter((d: OWIDMetaDataNode) => d.url);
      span.append('span').text(' (');
      span.append('a')
        .attr('href', (d: OWIDMetaDataNode) => d.url)
        .attr('target', 'new')
        .text('source');
      span.append('span').text(')');
    };

    this.variableTreeElement.selectionFilter = (item => item.years);

    this.pc.getDimensionLabel = (variableKey) => {
      const metaData = this.getMetaDataForVariableKey(variableKey);
      if (metaData) {
        return OwidComponent.trunc(metaData.key, 8);
      } else {
        return OwidComponent.trunc(variableKey, 8);
      }
    };

    const appendAxisBase = this.pc.appendAxis;
    const self = this;
    this.pc.appendAxis = (axis) => {
      appendAxisBase.call(this.pc, axis);

      this.pc.appendTooltip(axis, dimension => {
        const metaData = self.getMetaDataForVariableKey(dimension.key);
        if (metaData) {
          return metaData.title + ": " + metaData.description;
        } else {
          return dimension.key;
        }
      });
    };

    this.map.isDrawChoropleth = false;
  }

  createPath(): (datum, xdim, ydim) => Path {
    return (datum, xdim, ydim) => {
      const dims = [xdim, ydim];
      const countryDatas = dims.map(dim => this.countryDataCache[dim].variable.countries.find(country => country.code == datum.code));
      if (!(countryDatas[0] && countryDatas[1])) {
        return []; // data is only available for one or none of the variables (dims)
      }

      const points: Point[] = [];
      const xData = countryDatas[0];
      const yData = countryDatas[1];

      for (let xi = 0; xi < xData.years.length; xi++) {
        const xYear = xData.years[xi];
        for (let yi = 0; yi < yData.years.length; yi++) {
          const yYear = yData.years[yi];
          if (yYear == xYear || (yYear < xYear && yi < yData.years.length - 1 && yData.years[yi + 1] > xYear)) {
            points.push({
              x: xData.values[xi],
              y: yData.values[yi],
              label: "" + xYear,
            });
            if (yYear >= xYear) {
              break;
            }
          }
        }
      }

      return points;
    };
  }

  reverseArray(arr) {
    const result = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[arr.length - 1 - i] = arr[i];
    }
    return result;
  }
}
