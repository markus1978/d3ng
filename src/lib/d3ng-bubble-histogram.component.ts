import {Component, Input, OnChanges, Output, ViewChild, EventEmitter} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

/**
 * The expected data is an array of object with keys for x, value, and category. Where
 * x and value are metric and category is nominal. Keys can be customized via
 * xKey, valueKey, and categoryKey.
 */
@Component({
  selector: 'd3ng-bubble-histogram',
  template: `
    <div #chart></div>`,
  styleUrls: [ './d3ng-bubble-histogram.component.css']
})
export class D3ngBubbleHistogramComponent extends D3ngChart {

  @ViewChild('chart') chart;

  @Input() xKey = "x";
  @Input() valueKey = "value";
  @Input() categoryKey = "category";

  private d3Chart = null;
  private zoomableAxis = null;
  _zoomedExtent: number[];

  private _sliderX = 0;
  @Input() set sliderX(value: number) {
    this._sliderX = value;
    this.updateSliderX(value);
  }
  @Output() sliderXChange = new EventEmitter<number>();

  @Input() set zoomedExtent(value: number[]) {
    this._zoomedExtent = value;
    this.redraw();
  }

  protected x(d: any): number {
    return d[this.xKey];
  }
  protected value(d: any): number {
    return d[this.valueKey];
  }
  protected category(d: any): any {
    return d[this.categoryKey];
  }
  protected categoryLabel(category: any): string {
    return category as string;
  }

  protected drawSelection(selection: D3ngSelection): void {

  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  private updateSliderX(value: number) {
    let doEmmit = value != this._sliderX; // do not emmit change, when set via setter

    this._sliderX = value;
    this._sliderX = this.checkSliderXValue();
    doEmmit = doEmmit || this._sliderX != value;

    if (doEmmit) {
      setTimeout(() => this.sliderXChange.emit(value), 0);
    }

    // highlight closest data
    if (this.d3Chart) {
      const dists = {};
      const highlightDataMap = {};
      this.data.forEach(data => {
        const category = this.category(data);
        const currentDist = this._sliderX - this.x(data);
        if (currentDist >= 0) {
          const dist = dists[category];
          if (!dist || currentDist < dist) {
            dists[category] = currentDist;
            highlightDataMap[category] = data;
          }
        }
      });
      const highlighted = Object.keys(highlightDataMap).map(key => highlightDataMap[key]);
      this.d3Chart.selectAll(".dot").classed("highlighted", data => highlighted.indexOf(data) != -1);
    }
  }

  private checkSliderXValue(): number {
    let extent = null;
    if (this.zoomableAxis) {
      extent = this.zoomableAxis.zoomedExtent;
    } else {
      extent = d3.extent(this.data, d => this.x(d));
    }

    if (this._sliderX < extent[0]) {
      return extent[0];
    }
    if (this._sliderX > extent[1]) {
      return extent[1];
    }
    return this._sliderX;
  }

  /** creates linear scale and axis that can be zoomed with handles */
  private createZoomableAxis(range: number[], extent: number[]) {
    const width = extent[1] - extent[0];
    const insetExtent = [Number(extent[0]) - width * 0.001, Number(extent[1]) + width * 0.001];
    const fullScale = d3.scale.linear().range(range).domain(insetExtent);
    const fullAxis = d3.svg.axis().orient("bottom").scale(fullScale);
    const zoomedExtent = extent.slice(0);
    const zoomedScale = d3.scale.linear().range(range).domain(zoomedExtent);
    const zoomedAxis = d3.svg.axis().orient("top").scale(zoomedScale);

    const callbacks = [];
    let setHandleFunctions;

    return {
      append: (selection) => {
        selection.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0, 10)")
          .call(fullAxis);
        const zoomedAxisSvg = selection.append("g")
          .attr("class", "axis");
        zoomedAxisSvg.call(zoomedAxis);

        const zoomRect = selection.append("rect")
          .attr("y", 0)
          .attr("height", 10);
        const updateZoomRect = () => zoomRect
          .attr("x", fullScale(zoomedExtent[0]))
          .attr("width", fullScale(zoomedExtent[1]) - fullScale(zoomedExtent[0]));
        updateZoomRect();

        const createHandle = (selection: any, index: number) => {
          const handle = selection.append("polygon");
          const handleTriangle = (x: number, direction: number) => `${x},10 ${x},0 ${x - 5 * direction},0`;
          const updateHandle = () => handle
            .attr("points", handleTriangle(fullScale(zoomedExtent[index]), index == 0 ? 1 : -1));
          updateHandle();
          const setHandle = (x) => {
            if (x >= insetExtent[0] && x <= insetExtent[1]) {
              const test = zoomedExtent.slice(0);
              test[index] = x;
              if (test[0] < test[1]) {
                zoomedExtent[index] = x;
                zoomedScale.domain(zoomedExtent);
                zoomedAxisSvg.call(zoomedAxis);
                updateHandle();
                updateZoomRect();
                this._zoomedExtent = zoomedExtent.slice(0);
                callbacks.forEach(callback => callback(zoomedExtent));
              }
            }
          };
          handle.call(d3.behavior.drag()
            .on("drag", () => {
              setHandle(fullScale.invert(d3.event.x));
            })
          );
          return setHandle;
        };
        setHandleFunctions = [createHandle(selection, 0), createHandle(selection, 1)];
      },
      scale: zoomedScale,
      onChanged: (callback: (zoomedExtent: number[]) => void) => {
        callbacks.push(callback);
      },
      zoomedExtent: zoomedExtent,
      setZoom: (extent) => {
        setHandleFunctions[0](extent[0]);
        setHandleFunctions[1](extent[1]);
      }
    };
  }

  protected draw() {
    if (!this.data || this.data.length == 0) {
      return;
    }

    // extract categories array from data
    const categories = [];
    this.data.forEach(data => {
      const category = this.category(data);
      if (categories.indexOf(category) == -1) {
        categories.push(category);
      }
    });

    // constants and helper
    const maxBubbleSize = 80;
    const categoryHeight = maxBubbleSize * 0.6;
    const margin = {top: 10, right: 5, bottom: 60, left: 5};
    const width = this.chart.nativeElement.offsetWidth - margin.left - margin.right;
    const height = (categories.length + 1) * categoryHeight - margin.top - margin.bottom;
    const categoryScale = (category: any) => {
      const index = categories.indexOf(category);
      return index * categoryHeight + categoryHeight * 0.5;
    };
    const max = d3.max(this.data, d => this.value(d));
    const valueScale = (value: number) => {
      return maxBubbleSize * (value / max) * 0.5;
    };

    const d_chart = d3.select(this.chart.nativeElement);
    const svg = d_chart.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.d3Chart = svg;

    // the x-axis
    this.zoomableAxis = this.createZoomableAxis([0, width], d3.extent(this.data, d => this.x(d)));
    svg.append("g")
      .attr("class", "scale")
      .attr("transform", "translate( 0, " + (height + margin.bottom - 33) + ")")
      .call(this.zoomableAxis.append);

    // the categories
    const categoriesSvg = svg.selectAll(".category")
      .data(categories)
      .enter().append("g")
      .attr("class", "category")
      .attr("transform", data => "translate(0, " + categoryScale(data) + ")");
    categoriesSvg.append("text")
      .attr("text-anchor", "left")
      .attr("y", -22)
      .text(d => this.categoryLabel(d));
    categoriesSvg.append("path")
      .attr("d", data => d3.svg.line()([[0, 0], [width, 0]]));

    // the bubbles
    const bubbles = svg.selectAll(".dot")
      .data(this.data)
      .enter().append("rect")
      .attr("class", "dot")
      .attr("height", d => valueScale(this.value(d)))
      .attr("width", 2);
    const updateBubbles = () => bubbles
      .attr("x", d => this.zoomableAxis.scale(this.x(d)))
      .attr("y", d => categoryScale(this.category(d)) - valueScale(this.value(d)));
    updateBubbles();

    this.zoomableAxis.onChanged(() => {
      updateBubbles();
    });

    this.appendTooltip(bubbles, d => "" + this.value(d));

    // the slider
    this.updateSliderX(this._sliderX);
    const slider = svg.append("g")
      .attr("class", "slider");
    slider.append("path")
      .attr("d", d3.svg.line()([[0, -33], [0, height + margin.bottom - 33]]));
    slider.append("text")
      .attr("text-anchor", "left")
      .attr("y", 15)
      .attr("x", 5);

    const updateSlider = () => {
      slider.x = this.zoomableAxis.scale(this._sliderX);
      slider.attr("transform", "translate(" + slider.x + ")");
      slider.select("text").text("" + Number(this._sliderX).toFixed(0));
    };
    updateSlider();

    slider.call(d3.behavior.drag()
      .on("drag", () => {
        const x = this.zoomableAxis.scale.invert(d3.event.x);
        if (x >= this.zoomableAxis.zoomedExtent[0] && x <= this.zoomableAxis.zoomedExtent[1]) {
          this.updateSliderX(x);
          updateSlider();
        }
      })
    );

    this.zoomableAxis.onChanged(() => {
      this.updateSliderX(this.zoomableAxis.scale.invert(slider.x));
      updateSlider();
    });

    if (this._zoomedExtent) {
      this.zoomableAxis.setZoom(this._zoomedExtent);
    }
  }
}
