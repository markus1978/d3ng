import {Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngParallelCoordinatesComponent} from "../../lib/d3ng-parallel-coordinates.component";
import {D3ngCollapsibleIndentedTreeComponent} from "../../lib/d3ng-collapsible-indented-tree.component";
import * as d3 from "d3";
import {D3ngGroupContext} from "../../lib/d3ng-groups.component";
import {D3ngMapComponent} from "../../lib/d3ng-map.component";
import {Observable} from "rxjs/Observable";
import * as jsonata from "jsonata";
import {OWIDMetaDataNode, OWIDVariableMetaData, treeFilter, treeForEach} from "./owid.data";

@Component({
  selector: 'app-owid',
  templateUrl: './owid.component.html',
  styleUrls: ['./owid.component.css']
})
export class OwidComponent implements OnInit {

  private static extractTimeExtent = jsonata('{"min": $min(data.years), "max": $max(data.years)}').evaluate;
  private static defaultTimeExtent = { min: 1000, minLabel: "1000 AD", max: 2200, maxLabel: "2200 AD" };

  // The group context that controls the data flow between charts and  chart groups.
  context = new D3ngGroupContext();
  // The list of selected countries by their country code.
  selectedCountries: string[] = [];
  // The root nodes of the meta data tree.
  metaDataRoots: OWIDMetaDataNode[] = [];
  // The list of user selected variables.
  selectedVariables: OWIDMetaDataNode[] = [];

  // The list of variables that we initially have selected for the user.
  private initialVariableKeys = [
    "UN – Population Division (Fertility) – 2015 revision",
    "Gapminder (child mortality estimates version 8)",
   // "Rate of Natural Population Increase – UN 2015",
    "Population Density",
    "Population by Country (Clio Infra)",
    "Life Expectancy at Birth (both genders)"
  ];

  // scatterPlotConfig = null;
  // data: any[] = [];
  //
  // private metaByKey = {};
  // metaDataList = [];
  //
  // private year = 2017;
  // private timeExtent = OwidComponent.defaultTimeExtent;
  //
  // private tsdata = [];
  //
  // tsHistogramData = [];

  @ViewChild('meta') variableTreeElement: D3ngCollapsibleIndentedTreeComponent;
  // @ViewChild('pc') pc: D3ngParallelCoordinatesComponent;
  // @ViewChild('map') map: D3ngMapComponent;

  constructor(private http: Http) {
    this.http.get('/assets/owid-new/owid_metadata.json')
      .map((res: Response) => res.json())
      .subscribe((res: OWIDMetaDataNode) => {
        this.metaDataRoots = [res];
        const selectedVariables: OWIDVariableMetaData[] = [];
        treeForEach(res, ((node: OWIDMetaDataNode) => {
          if (this.initialVariableKeys.indexOf(node.key) != -1) {
            if (!selectedVariables.find(variable => variable.key == node.key)) {
              selectedVariables.push(node as OWIDVariableMetaData);
            }
          }
        }));
        this.selectedVariables = selectedVariables;
      });
  }

  selectedVariablesChanged(variables: OWIDVariableMetaData[]): void {

  }

  // private setDB(db: any): void {
  //
  //   // filter and flatten meta data directory
  //   const filter = (node, pred: (any) => boolean) => {
  //     if (node.children) {
  //       node.children = node.children.filter(child => filter(child, pred));
  //       return node.children.length > 0;
  //     } else {
  //       return pred(node);
  //     }
  //   };
  //   const meta = db.meta.filter(m => filter(m, node => (node.countries > 100 && node.number)));
  //
  //   // keep meta dict
  //   const visit = (node) => {
  //     if (node.children) {
  //       node.children.forEach(child => visit(child));
  //     }
  //
  //     if (node.key) {
  //       this.metaByKey[node.key] = node;
  //     }
  //   };
  //   meta.forEach(meta => visit(meta));
  //
  //   this.metaDataList = [{
  //     label: "OWID Data",
  //     children: meta
  //   }];
  //
  //   this.metaByKey['Population Density'].scale = 0.25;
  //   this.metaByKey['Population by Country (Clio Infra)'].scale = 0.25;
  //   this.metaByKey['Life Expectancy at Birth (both genders)'].scale = 4;
  //
  //   this.metaDataListElement.preDirectSelection = this.startDimensions.map(key => this.metaByKey[key]);
  // }
  //
  // setDimensions(dimensions: any[]): void {
  //   dimensions = dimensions.filter(d => d);
  //   this.data = [];
  //   this.dimensionsData = dimensions;
  //   this.dimensions = dimensions.map(d => d.key);
  //   if (!this.map.choropleth) {
  //     this.map.choropleth = this.dimensions[0];
  //   }
  //
  //   this.updateData(dimensions, this.year);
  // }
  //
  // private loadDimensionData(dimensions: any[], onComplete: () => void) {
  //   const notYetLoadedDimensions = dimensions.filter(dim => this.tsdata.findIndex(data => data.key == dim.key) == -1);
  //   const requests = notYetLoadedDimensions.map(dim => this.http.get("/assets/owid/" + dim.fileName).map(res => {
  //     return {
  //       meta: dim,
  //       data: res.json()
  //     };
  //   }));
  //   if (requests.length > 0) {
  //     Observable.forkJoin(requests).subscribe(results => {
  //       results.forEach(result => this.tsdata.push({
  //         key: result.meta.key,
  //         data: result.data
  //       }));
  //       onComplete();
  //     });
  //   } else {
  //     onComplete();
  //   }
  // }

  // /**
  //  * Creates a data array with objects for all countries with all dimensions and values that are closest before year.
  //  * Countries are filtered. Only countries with data before year for all dimensions.
  //  * @param dimensions Meta data objects for the dimensions
  //  * @param year The year as a number
  //  */
  // private extractSnapshot(dimensions: any[], year: number): any[] {
  //   if (dimensions.length == 0) {
  //     return [];
  //   }
  //
  //   const value = (years: number[], values: number[]) => {
  //     let value = 0;
  //     let dist = 100000;
  //     for (let i = 0; i < years.length; i++) {
  //       const cValue = values[i];
  //       if (years[i] <= year && cValue != 0) {
  //         const cDist = year - years[i];
  //         if (cDist < dist) {
  //           value = cValue;
  //           dist = cDist;
  //         }
  //       }
  //     }
  //     return value;
  //   };
  //
  //   return this.tsdata.filter(data => dimensions.d3ngExists(dim => dim.key == data.key))
  //     .d3ngFlatten("data", (inner: any, outer: any) => {
  //       return {
  //         code: inner.code,
  //         label: inner.label,
  //         value: value(inner.years, inner.values),
  //         key: outer.key,
  //       };
  //     })
  //     // .filter(obj => obj.value && obj.value != 0)
  //     .d3ngJoin("code",
  //       first => {
  //         return {
  //           code: first.code,
  //           label: first.label,
  //         };
  //       },
  //       (target, source) => {
  //         target[source.key] = source.value;
  //       }
  //     )
  //     .filter(obj => Object.keys(obj).length == dimensions.length + 2);
  // }
  //
  // private extractTimeExtent(dimensions: any[]): any {
  //   let gmin = 3000;
  //   let gmax = 0;
  //   this.tsdata.filter(data => dimensions.d3ngExists(dim => dim.key == data.key))
  //     .map(data => data.data)
  //     .forEach(countriesData => countriesData.forEach(countryData => {
  //       const max = countryData.years[countryData.years.length - 1];
  //       const min = countryData.years[0];
  //       if (min < gmin) {
  //         gmin = min;
  //       }
  //       if (max > gmax) {
  //         gmax = max;
  //       }
  //     }));
  //   if (gmin > gmax) {
  //     return OwidComponent.defaultTimeExtent;
  //   }
  //
  //   return {
  //     min: gmin,
  //     minLabel: (gmin < 0 ? (-gmin) + " BC" : gmin + " AD"),
  //     max: gmax,
  //     maxLabel: gmax + " AD"
  //   };
  // }
  //
  // private extractTSHistogramData(dimensions: any[]): any[] {
  //   const result = [];
  //   this.tsdata.filter(data => dimensions.d3ngExists(dim => dim.key == data.key)).forEach(data => {
  //     const category = data.key;
  //     const values = {};
  //     data.data.forEach(countryData => {
  //       for (let i = 0; i < countryData.years.length; i++) {
  //         if (countryData.values[i] != 0) {
  //           const year = countryData.years[i];
  //           if (values[year]) {
  //             values[year]++;
  //           } else {
  //             values[year] = 1;
  //           }
  //         }
  //       }
  //     });
  //     Object.keys(values).forEach(key => {
  //       result.push({
  //         category: category,
  //         year: key,
  //         value: values[key]
  //       });
  //     });
  //   });
  //   return result;
  // }
  //
  // private updateData(dimensions: any[], year: number, onlyYear?: boolean) {
  //   this.countries = []; // clear current selected countries, old data will soon be invalid
  //   this.loadDimensionData(dimensions, () => {
  //     if (!onlyYear) {
  //       this.tsHistogramData = this.extractTSHistogramData(dimensions);
  //       const extent: number[] = d3.extent(this.tsHistogramData, d => d.year);
  //       this.timeExtent = {
  //         min: extent[0],
  //         minLabel: (extent[0] < 0 ? (-extent[0]) + " BC" : extent[0] + " AD"),
  //         max: extent[1],
  //         maxLabel: extent[1] + " AD"
  //       };
  //     }
  //     this.data = this.extractSnapshot(dimensions, year);
  //   });
  // }
  //
  // onTimeChanged(value: number): void {
  //   this.year = Number(Number(value).toFixed(0));
  //   this.updateData(this.dimensionsData, this.year, true);
  // }

  ngOnInit() {
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

    // this.pc.getDimensionLabel = (dim) => {
    //   const meta = this.metaByKey[dim];
    //   if (meta) {
    //     return this.trunc(meta.key, 8);
    //   } else {
    //     return this.trunc(dim, 8);
    //   }
    // };
    //
    // // this should be moved into parallel coordinates (or all axis based visualizations)!
    // this.pc.appendAxis = (axis) => {
    //   axis.selectAll('.axisTitle').attr("y", -15);
    //   this.pc.appendTooltip(axis, d => {
    //     const meta = this.metaByKey[d];
    //     if (meta) {
    //       return meta.label + ": " + meta.description;
    //     } else {
    //      return d;
    //     }
    //   });
    //
    //   const addScaleArrow = (direction) => {
    //     axis.filter(d => this.metaByKey[d]).append('svg:text')
    //       .text(direction > 0 ? '>' : '<')
    //       .attr("text-anchor", "middle")
    //       .attr("y", -4)
    //       .attr("x", 5 * direction)
    //       .attr("style", "font-size: 11px; cursor: pointer;")
    //       .on('click', (d) => {
    //         if (!this.metaByKey[d].scale) {
    //           this.metaByKey[d].scale = 1;
    //         }
    //         this.metaByKey[d].scale = direction > 0 ? this.metaByKey[d].scale * 1.2 : this.metaByKey[d].scale / 1.2;
    //         this.pc.redraw();
    //       });
    //   };
    //   addScaleArrow(1);
    //   addScaleArrow(-1);
    // };
    //
    // this.pc.getScaleForDimension = (dim) => {
    //   const meta = this.metaByKey[dim];
    //   if (meta) {
    //     let scale = this.metaByKey[dim].scale;
    //     if (!scale) {
    //       scale = 1;
    //     }
    //     return d3.scale.pow().exponent(scale);
    //   }
    //   return d3.scale.linear();
    // };
  }
  //
  // private trunc(str: string, n: number): string {
  //   return (str.length > n) ? str.substr(0, n - 1) + '..' : str;
  // }
}

// declare global {
//   interface Array<T> {
//     d3ngFlatten<R>(childrenKey: string, combine: (inner: T, outer: any) => R): Array<R>;
//     d3ngJoin<R>(joinKey: string, create: (first: T) => R, join: (target: R, source: T) => void): Array<R>;
//     d3ngOut(): Array<T>;
//     d3ngExists(pred: (T) => boolean): boolean;
//   }
// }
//
// if (!Array.prototype.d3ngExists) {
//   Array.prototype.d3ngExists = function<T>(pred: (T) => boolean) {
//     return this.findIndex(pred) != -1;
//   };
// }
//
// if (!Array.prototype.d3ngOut) {
//   Array.prototype.d3ngOut = function() {
//     console.log(this);
//     return this;
//   };
// }
//
// if (!Array.prototype.d3ngFlatten) {
//   Array.prototype.d3ngFlatten = function<R> (childKey: string, combine: (inner, outer) => R): Array<R> {
//     const result = [];
//     this.forEach(outer => {
//       outer[childKey].forEach(inner => {
//         result.push(combine(inner, outer));
//       });
//     });
//     return result;
//   };
// }
//
// if (!Array.prototype.d3ngJoin) {
//   Array.prototype.d3ngJoin = function(joinKey: string, create: (first) => any, join: (target, source) => void) {
//     const map = {};
//     const result = [];
//     this.forEach(obj => {
//       const key = obj[joinKey];
//       let target = map[key];
//       if (!target) {
//         target = create(obj);
//         map[key] = target;
//         result.push(target);
//       }
//       join(target, obj);
//     });
//     return result;
//   };
// }
