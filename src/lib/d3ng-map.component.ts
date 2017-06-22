import {Component, forwardRef, Input, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";
import {D3ngMapData} from "./d3ng-map.data";

@Component({
  selector: 'd3ng-map',
  providers: [{provide: D3ngChart, useExisting: forwardRef(() => D3ngMapComponent)}],
  template: `    
    <div #chart></div>`,
  styles: [ ':host div { display: block; position: relative; }']
})
export class D3ngMapComponent extends D3ngChart {
  @ViewChild('chart') chart;

  @Input() idKey: string = "id";

  private _choropleth: string = null;
  @Input('choropleth')
  set choropleth(value: string) {
    this._choropleth = value;
    this.redraw();
  }
  get choropleth(): string {
    return this._choropleth;
  }

  public getId(d: any): string {
    return d[this.idKey];
  }

  private geoData: any[] = D3ngMapData.worldCountries.slice(0);
  private d3Chart: any = null;
  private color: any = null;

  @Input() config: {
    choroplethColors: string[]
  } = null;

  protected drawSelection(selection: D3ngSelection): void {
    if (this.geoData && this.d3Chart) {
      this.d3Chart.selectAll("path").style("fill", dataPoint => {
        const color = selection.selectionColor(dataPoint.original);
        if (color == "black") {
          return this.colorize(dataPoint);
        } else {
          const origColor = this.colorize(dataPoint);
          if (origColor == "lightgrey") {
            return color;
          } else {
            return d3.interpolateRgb(d3.rgb(origColor), d3.rgb(color))(0.5);
          }
        }
      });
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {
    if (!(this.data && this.geoData)) {
      return;
    }

    const idMap = {};
    this.data.forEach(d => { idMap[this.getId(d)] = d; });
    this.geoData.forEach(geoDatum => {
      geoDatum.original = idMap[geoDatum.id];
    });

    const self = this;

    this.chart.nativeElement.style.height = (this.chart.nativeElement.offsetWidth * 5 / 7) + "px";

    const margin = {top: 0, right: 0, bottom: 0, left: 0},
      w = this.chart.nativeElement.offsetWidth  - margin.left - margin.right,
      h = (this.chart.nativeElement.offsetWidth * 457.0 / 700.0)  - margin.top - margin.bottom;

    const extent = d3.extent(self.data, d => d[this._choropleth]);
    let choroplethColors = ["#0000FF", "#FF0000"];
    if (this.config && this.config.choroplethColors && this.config.choroplethColors.length >= 2) {
      choroplethColors = this.config.choroplethColors;
    }
    const color = d3.scale.linear().domain(extent)
      .interpolate(d3.interpolateRgb)
      .range([d3.rgb(choroplethColors[0]), d3.rgb(choroplethColors[1])]);
    this.color = color;

    const path = d3.geo.path()
      .projection(function mercator(coordinates) {
      return [
        (coordinates[0]+180)*w / 360,
        ((-180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + coordinates[1] * Math.PI / 360)))+180)*(h*1.2) / 360
      ];
    });

    const d_chart = d3.select(self.chart.nativeElement);
    const svg = d_chart.append("svg")
      .attr("width", w)
      .attr("height", h);
    this.d3Chart = svg;

    const states = svg.append("svg:g")
      .attr("id", "states");

    const paths = states.selectAll("path")
      .data(this.geoData)
      .enter().append("svg:path")
      .style("fill", d => this.colorize(d))
      .attr("d", path)
      .on("click", dataPoint => {
        if (dataPoint.original) {
          this.setDirectSelection([dataPoint.original]);
        } else {
          this.setDirectSelection([]);
        }
      });

    this.appendTooltip(paths, d => d.properties.name);
  }

  private colorize(d) {
    if (d.original) {
      const value = d.original[this._choropleth];
      if (value) {
        return this.color(value);
      }
    }
    return "lightgrey";
  }
}
