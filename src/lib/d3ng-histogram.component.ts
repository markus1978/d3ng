import {Component, Input, ViewChild} from "@angular/core";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";
import * as d3 from "d3";

@Component({
  selector: 'd3ng-histogram',
  templateUrl: './d3ng-histogram.component.html',
  styleUrls: ['./d3ng-histogram.component.css']
})
export class D3ngHistogramComponent extends D3ngChart {

  @ViewChild('chart') chart;

  @Input() valueKey = "value";
  @Input() config: {
    numberOfBuckets: number;
    numberOfTicks: number;
  } = null;

  private d3Chart = null;

  value(datum: any) {
    return datum[this.valueKey];
  }

  protected drawSelection(selection: D3ngSelection): void {
    if (this.d3Chart) {
      this.d3Chart.selectAll("rect").style("fill", bucket => {
        const color = selection.selectionColor(bucket, (selected, bucket) => {
          return bucket.data.findIndex(datum => selected.findIndex(d => d == datum) != -1) != -1;
        });
        if (color == "black") {
          return "lightgrey";
        } else {
          return color;
        }
      });
    }
  }

  protected clear() {
    this.chart.nativeElement.innerHTML = "";
  }

  protected draw() {
    if (!this.data || this.data.length == 0) {
      return;
    }

    // calculate the buckets
    const valueExtent = d3.extent(this.data.map(datum => this.value(datum)));
    const numberOfBuckets = this.config ? this.config.numberOfBuckets : 10;
    const buckets = new Array(numberOfBuckets);
    const xAxisTickValues = new Array(numberOfBuckets + 1);
    const bucketSize = (valueExtent[1] - valueExtent[0]) / numberOfBuckets;
    for (let i = 0; i < numberOfBuckets; i++) {
      xAxisTickValues[i] = valueExtent[0] + bucketSize * i;
      buckets[i] = {
        x: valueExtent[0] + bucketSize * i,
        value: 0,
        data: []
      };
    }
    xAxisTickValues[numberOfBuckets] = valueExtent[0] + bucketSize * numberOfBuckets;
    let maxValue = 0;
    this.data.forEach(datum => {
      const bucketIndex = Math.trunc((this.value(datum) - valueExtent[0]) / bucketSize);
      const bucket = buckets[bucketIndex == numberOfBuckets ? bucketIndex - 1 : bucketIndex];
      bucket.value++;
      maxValue = Math.max(maxValue, bucket.value);
      bucket.data.push(datum);
    });

    // create the chart
    const margin = {top: 7, right: 15, bottom: 30, left: 40},
      width = this.chart.nativeElement.offsetWidth  - margin.left - margin.right,
      height = this.chart.nativeElement.offsetHeight  - margin.top - margin.bottom;

    const xScale = d3.scale.linear().range([0, width]).domain(valueExtent);
    const yScale = d3.scale.linear().range([height, 0]).domain([0, maxValue]);

    const xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues(xAxisTickValues);
    const yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10).tickFormat(d3.format("d"));

    const d_chart = d3.select(this.chart.nativeElement);
    const svg = d_chart.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.d3Chart = svg;

    const bars = svg.selectAll(".dot")
      .data(buckets)
      .enter().append("rect");
    bars.attr("class", "dot")
      .attr("fill", "lightgrey")
      .attr("x", bucket => xScale(bucket.x) + 3)
      .attr("width", bucket => xScale(bucket.x + bucketSize) - xScale(bucket.x) - 6)
      .attr("y", bucket => yScale(bucket.value))
      .attr("height", bucket =>  yScale(0) - yScale(bucket.value));

    bars.on("click", bucket => {
      this.setDirectSelection(bucket.data);
    });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  }
}
