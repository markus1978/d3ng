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
import {D3ngHistogramDemoComponent} from "../demos/d3ng-histogram-demo.component";
import {D3ngHistogramComponent} from "../../lib/d3ng-histogram.component";

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

  // The list of variables that we initially have selected for the user.
  initialVariablesConfig = [
    {
      key: "UN – Population Division (Fertility) – 2015 revision",
      scale: 1,
      direction: 1
    },
    {
      key: "Gapminder (child mortality estimates version 8)",
      scale: 1,
      direction: 1
    },
    {
      key: "Population by Country (Clio Infra)",
      scale: 0.125,
      direction: 1
    },
    {
      key: "Life Expectancy at Birth (both genders)",
      scale: 2,
      direction: -1
    }
  ];

  tsHistogramData: {category: string, x: number, value: number}[] = [];
  timeExtent: {min: number, max: number, minLabel: string, maxLabel: string} = OwidComponent.defaultTimeExtent;

  _selectedYear = 2017;
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
  selectedCountries = [];

  @ViewChild('metaHistogram') variableHistogram: D3ngHistogramComponent;
  @ViewChild('meta') variableTreeElement: D3ngCollapsibleIndentedTreeComponent;
  @ViewChild('pc') pc: D3ngParallelCoordinatesComponent;
  @ViewChild('map') map: D3ngMapComponent;

  private static trunc(str: string, n: number): string {
    return (str.length > n) ? str.substr(0, n - 1) + '..' : str;
  }

  constructor(private http: Http) {
    this.http.get('/assets/owid/owid_metadata.json')
      .map((res: Response) => res.json())
      .subscribe((res: OWIDMetaDataNode) => {
        this.metaDataRoots = [res];
        this.originalMetaDataRoots = [res];
        const selectedVariables: OWIDVariableMetaData[] = [];
        treeForEach(res, ((node: OWIDMetaDataNode) => {
          if (this.initialVariablesConfig.find(variable => node.key == variable.key)) {
            if (!selectedVariables.find(variable => variable.key == node.key)) {
              selectedVariables.push(node as OWIDVariableMetaData);
            }
          }
        }));
        this.selectedVariables = selectedVariables;
      });
  }

  onSelectedVariablesChanged(): void {
    // update time series histogram data
    let minYear = Number.MIN_SAFE_INTEGER;
    let maxYear = Number.MAX_SAFE_INTEGER;
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

    // update the choropleth dimension
    if (!this.selectedVariables.find(variable => variable.key == this.map.choropleth)) {
      if (this.selectedVariables.length > 0) {
        this.map.choropleth = this.selectedVariables[0].key;
      } else {
        this.map.choropleth = null;
      }
    }

    this.updateCountryData(() => this.countryDataDimensions = this.selectedVariables.map(variable => variable.key));
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

          if (value) {
            let countryData = countryMap[country.code];
            if (!countryData) {
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
  }
}
