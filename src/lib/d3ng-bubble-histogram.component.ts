import {Component, Input, OnChanges, ViewChild} from "@angular/core";
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

  @Input() xKey: string;
  @Input() valueKey: string;
  @Input() categoryKey: string;

  private d3Chart = null;

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

  protected draw() {
    const categories = [];
    this.data.forEach(data => {
      const category = this.category(data);
      if (categories.indexOf(category) == -1) {
        categories.push(category);
      }
    });

    const maxBubbleSize = 80;
    const categoryHeight = maxBubbleSize * 0.6;
    const margin = {top: 5, right: 5, bottom: 30, left: 5};
    const width = this.chart.nativeElement.offsetWidth - margin.left - margin.right;
    const height = (categories.length + 1) * categoryHeight - margin.top - margin.bottom;
    const xScale = d3.scale.linear().range([0, width]).domain(d3.extent(this.data, d => this.x(d))).nice();
    const xAxis = d3.svg.axis().scale(xScale).orient("bottom");
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

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.selectAll(".category")
      .data(categories)
      .enter().append("text")
      .attr("class", "category")
      .attr("text-anchor", "left")
      .attr("y", d => categoryScale(d))
      .text(d => this.categoryLabel(d));

    const bubbles = svg.selectAll(".dot")
      .data(this.data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", d => valueScale(this.value(d)))
      .attr("cx", d => xScale(this.x(d)))
      .attr("cy", d => categoryScale(this.category(d)));

    this.appendTooltip(bubbles, d => "" + this.value(d));
  }
}
