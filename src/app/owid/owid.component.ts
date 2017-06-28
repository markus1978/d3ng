import {Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from "@angular/http";
import {D3ngParallelCoordinatesComponent} from "../../lib/d3ng-parallel-coordinates.component";
import {D3ngCollapsibleIndentedTreeComponent} from "../../lib/d3ng-collapsible-indented-tree.component";
import * as d3 from "d3";
import {D3ngGroupContext} from "../../lib/d3ng-groups.component";
import {D3ngMapComponent} from "../../lib/d3ng-map.component";
import {Observable} from "rxjs";
import * as joiner from "joiner";

@Component({
  selector: 'app-owid',
  templateUrl: './owid.component.html',
  styleUrls: ['./owid.component.css']
})
export class OwidComponent implements OnInit {

  static defaultTimeExtent = { min: 1000, max: 2200 };

  countries: any[] = [];

  context = new D3ngGroupContext();

  scatterPlotConfig = null;

  private db: {
    data: [{
      code: string,
      label: string,
      data: [{
        key: string,
        value: any
      }]
    }],
    meta: any[]
  } = null;

  metaDataList: any[] = [];
  dimensions = [];
  dimensionsData = [];
  private startDimensions = [
    "UN – Population Division (Fertility) – 2015 revision",
    "Gapminder (child mortality estimates version 8)",
    "Rate of Natural Population Increase – UN 2015",
    "Population Density",
    "Population by Country (Clio Infra)",
    "Life Expectancy at Birth (both genders)"
  ];
  data: any[] = [];
  private metaByKey = {};

  private year: number = 2017;
  private timeExtent = OwidComponent.defaultTimeExtent;

  // a dictionary for already loaded time series data with meta key as key and loaded json as value
  private tsdata = {};

  @ViewChild('meta') metaDataListElement: D3ngCollapsibleIndentedTreeComponent;
  @ViewChild('pc') pc: D3ngParallelCoordinatesComponent;
  @ViewChild('map') map: D3ngMapComponent;

  constructor(private http: Http) {
    this.http.get('/assets/owid-2017.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setDB(res);
      });
  }

  private setDB(db: any): void {
    this.db = db;

    // restructure data
    db.data.forEach(data => {
      data.data.forEach(value => {
        data[value.key] = value.value;
      });
      data.data = undefined;
    });

    // filter and flatten meta data directory
    const filter = (node, pred: (any) => boolean) => {
      if (node.children) {
        node.children = node.children.filter(child => filter(child, pred));
        return node.children.length > 0;
      } else {
        return pred(node);
      }
    };
    this.db.meta = this.db.meta.filter(m => filter(m, node => (node.countries > 100 && node.number)));

    // keep meta dict
    const visit = (node) => {
      if (node.children) {
        node.children.forEach(child => visit(child));
      }

      if (node.key) {
        this.metaByKey[node.key] = node;
      }
    };
    this.db.meta.forEach(meta => visit(meta));

    this.metaDataList = [{
      label: "OWID Data",
      children: this.db.meta
    }];

    this.metaByKey['Population Density'].scale = 0.25;
    this.metaByKey['Population by Country (Clio Infra)'].scale = 0.25;
    this.metaByKey['Life Expectancy at Birth (both genders)'].scale = 4;

    this.metaDataListElement.preDirectSelection = this.startDimensions.map(key => this.metaByKey[key]);
  }

  setDimensions(dimensions: any[]): void {
    dimensions = dimensions.filter(d => d);
    // // filter data
    // this.data = this.db.data.filter(country => {
    //   let filter = false;
    //   dimensions.forEach(meta => {
    //     if (country[meta.key] == 0) {
    //       filter = true;
    //     }
    //   });
    //   return !filter;
    // });
    this.data = [];

    this.dimensionsData = dimensions;
    this.dimensions = dimensions.map(d => d.key);
    if (!this.map.choropleth) {
      this.map.choropleth = this.dimensions[0];
    }

    this.updateData(dimensions, this.year);
  }

  private loadDimensionData(dimensions: any[], onComplete: ()=>void) {
    const notYetLoadedDimensions = dimensions.filter(dim => !this.tsdata[dim]);
    const requests = notYetLoadedDimensions.map(dim => this.http.get("/assets/owid/" + dim.fileName).map(res => {
      return {
        meta: dim,
        data: res.json()
      }
    }));
    if (requests.length > 0) {
      Observable.forkJoin(requests).subscribe(results => {
        results.forEach(result => this.tsdata[result.meta.key] = result.data);
        onComplete();
      });
    } else {
      onComplete();
    }
  }

  /**
   * Creates a data array with objects for all countries with all dimensions and values that are closest before year.
   * Countries are filtered. Only countries with data before year for all dimensions.
   * @param dimensions Meta data objects for the dimensions
   * @param year The year as a number
   */
  private extractSnapshot(dimensions: any[], year: number): any[] {
    if (dimensions.length == 0) {
      return [];
    }

    const dimDataForYear = dimensions.map(dim => {
      return this.tsdata[dim.key].map(countryData => {
        let value = null;
        for (let index = 0; index < countryData.years.length; index++) {
          if (countryData.years[index] <= year) {
            const countryValue = countryData.values[index];
            if (countryValue && countryValue != 0) {
              value = countryValue;
            }
          }
        }
        const result = {
          code: countryData.code,
          label: countryData.label
        };
        if (value != null) {
          result[dim.key] = value;
        }
        return result;
      }).filter(countryDataForYear => countryDataForYear[dim.key]);
    });

    const joinerConfig: any = {
      leftDataKey: 'code',
      rightDataKey: 'code'
    };
    let result = dimDataForYear[0];
    for(let i = 1; i < dimDataForYear.length; i++) {
      joinerConfig.leftData = result;
      joinerConfig.rightData = dimDataForYear[i];
      const joinerResult = joiner(joinerConfig);
      result = joinerResult.data.filter(d => joinerResult.report.diff.a_and_b.indexOf(d.code) != -1);
    }

    return result;
  }

  private extractTimeExtent(dimensions: any[]): any {
    let gmin = 3000;
    let gmax = 0;
    dimensions.map(dim => this.tsdata[dim.key]).forEach(countriesData => countriesData.forEach(countryData => {
      const max = countryData.years[countryData.years.length - 1];
      const min = countryData.years[0];
      if (min < gmin) gmin = min;
      if (max > gmax) gmax = max;
    }));
    if (gmin > gmax) {
      return OwidComponent.defaultTimeExtent;
    }

    return {
      min: gmin,
      minLabel: (gmin < 0 ? (-gmin) + " BC" : gmin + " AD"),
      max: gmax,
      maxLabel: gmax + " AD"
    };
  }

  private updateData(dimensions: any[], year: number) {
    this.countries = []; // clear current selected countries, old data will soon be invalid
    this.loadDimensionData(dimensions, () => {
      this.timeExtent = this.extractTimeExtent(dimensions);
      this.data = this.extractSnapshot(dimensions, year);
    });
  }

  onTimeChanged(event: any): void {
    this.year = event.value;
    this.updateData(this.dimensionsData, this.year);
  }

  ngOnInit() {
    this.metaDataListElement.customLabel = (item) => {
      if (item.countries) {
        return "(" + item.countries + ") " + item.label;
      } else {
        return item.label;
      }
    };

    this.metaDataListElement.customizeEntrySpan = (span) => {
      span = span.filter(d => d.source);
      span.append('span').text(' (');
      span.append('a')
        .attr('href', d => d.source)
        .attr('target', 'new')
        .text('source');
      span.append('span').text(')');
    };

    this.metaDataListElement.selectionFilter = (item => item.countries);

    this.pc.getDimensionLabel = (dim) => {
      const meta = this.metaByKey[dim];
      if (meta) {
        return this.trunc(meta.key, 8);
      } else {
        return this.trunc(dim, 8);
      }
    };

    // this should be moved into parallel coordinates (or all axis based visualizations)!
    this.pc.appendAxis = (axis) => {
      axis.selectAll('.axisTitle').attr("y", -15);
      this.pc.appendTooltip(axis, d => {
        const meta = this.metaByKey[d];
        if (meta) {
          return meta.label + ": " + meta.description;
        } else {
         return d;
        }
      });

      const addScaleArrow = (direction) => {
        axis.filter(d => this.metaByKey[d]).append('svg:text')
          .text(direction > 0 ? '>' : '<')
          .attr("text-anchor", "middle")
          .attr("y", -4)
          .attr("x", 5 * direction)
          .attr("style", "font-size: 11px; cursor: pointer;")
          .on('click', (d) => {
            if (!this.metaByKey[d].scale) {
              this.metaByKey[d].scale = 1;
            }
            this.metaByKey[d].scale = direction > 0 ? this.metaByKey[d].scale * 1.2 : this.metaByKey[d].scale / 1.2;
            this.pc.redraw();
          });
      };
      addScaleArrow(1);
      addScaleArrow(-1);
    };

    this.pc.getScaleForDimension = (dim) => {
      const meta = this.metaByKey[dim];
      if (meta) {
        let scale = this.metaByKey[dim].scale;
        if (!scale) {
          scale = 1;
        }
        return d3.scale.pow().exponent(scale);
      }
      return d3.scale.linear();
    };
  }

  private trunc(str: string, n: number): string {
    return (str.length > n) ? str.substr(0, n - 1) + '..' : str;
  }
}
