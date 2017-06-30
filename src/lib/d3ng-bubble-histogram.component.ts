import {Component, Input, OnChanges, Output, ViewChild, EventEmitter} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

@Component({
  selector: 'd3ng-bubble-histogram',
  template: `
    <div #chart></div>`,
  styleUrls: [ './d3ng-bubble-histogram.component.css']
})

export class D3ngBubbleHistogramComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  @Input() xKey = "x";
  @Input() valueKey = "value";
  @Input() categoryKey = "category";

  private d3Chart = null;

  @Input() sliderX = 0;
  @Output() sliderXChange = new EventEmitter<number>();
  private setSliderX(value: number) {
    this.sliderX = value;
    this.sliderXChange.emit(value);
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
          handle.call(d3.behavior.drag()
              .on("drag", () => {
                const x = fullScale.invert(d3.event.x);
                if (x >= insetExtent[0] && x <= insetExtent[1]) {
                  const test = zoomedExtent.slice(0);
                  test[index] = x;
                  if (test[0] < test[1]) {
                    zoomedExtent[index] = x;
                    zoomedScale.domain(zoomedExtent);
                    zoomedAxisSvg.call(zoomedAxis);
                    updateHandle();
                    updateZoomRect();
                    callbacks.forEach(callback => callback(zoomedExtent));
                  }
                }
              })
            );
        };
        createHandle(selection, 0);
        createHandle(selection, 1);
      },
      scale: zoomedScale,
      onChanged: (callback: (zoomedExtent: number[]) => void) => {
        callbacks.push(callback);
      },
      zoomedExtent: zoomedExtent
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
    const margin = {top: 5, right: 5, bottom: 60, left: 5};
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
    const zoomableAxis = this.createZoomableAxis([0, width], d3.extent(this.data, d => this.x(d)));
    svg.append("g")
      .attr("class", "scale")
      .attr("transform", "translate( 0, " + (height + margin.bottom - 33) + ")")
      .call(zoomableAxis.append);

    // the categories
    svg.selectAll(".category")
      .data(categories)
      .enter().append("text")
      .attr("class", "category")
      .attr("text-anchor", "left")
      .attr("y", d => categoryScale(d))
      .text(d => this.categoryLabel(d));

    // the bubbles
    const bubbles = svg.selectAll(".dot")
      .data(this.data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", d => valueScale(this.value(d)));
    const updateBubbles = () => bubbles
      .attr("cx", d => zoomableAxis.scale(this.x(d)))
      .attr("cy", d => categoryScale(this.category(d)));
    updateBubbles();

    zoomableAxis.onChanged(() => {
      updateBubbles();
    });

    this.appendTooltip(bubbles, d => "" + this.value(d));

    // the slider
    if (this.sliderX < zoomableAxis.zoomedExtent[0]) {
      this.setSliderX(zoomableAxis.zoomedExtent[0]);
    }
    if (this.sliderX > zoomableAxis.zoomedExtent[1]) {
      this.setSliderX(zoomableAxis.zoomedExtent[1]);
    }
    const slider = svg.append("g")
      .attr("class", "slider");
    slider.append("path")
      .attr("d", d3.svg.line()([[0, 0], [0, height + margin.bottom - 33]]));
    slider.append("text")
      .attr("text-anchor", "left")
      .attr("y", 15)
      .attr("x", 5);

    const updateSlider = () => {
      slider.x = zoomableAxis.scale(this.sliderX);
      slider.attr("transform", "translate(" + slider.x + ")");
      slider.select("text").text("" + Number(this.sliderX).toFixed(0));
    };
    updateSlider();

    slider.call(d3.behavior.drag()
      .on("drag", () => {
        const x = zoomableAxis.scale.invert(d3.event.x);
        if (x >= zoomableAxis.zoomedExtent[0] && x <= zoomableAxis.zoomedExtent[1]) {
          this.setSliderX(x);
          updateSlider();
        }
      })
    );

    zoomableAxis.onChanged(() => {
      this.setSliderX(zoomableAxis.scale.invert(slider.x));
      updateSlider();
    });
  }
}
