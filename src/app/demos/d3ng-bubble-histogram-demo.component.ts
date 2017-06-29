import {Component} from '@angular/core';

@Component({
  selector: 'd3ng-bubble-histogram-demo',
  template: `
    <h2>D3ng Bubble Histogram Demo</h2>
    <d3ng-bubble-histogram [data]="data" xKey="x" valueKey="value" categoryKey="cat"></d3ng-bubble-histogram>
  `,
  styles: [ ]
})

export class D3ngBubbleHistogramDemoComponent {

  data = [
    { x : 1900, value: 10, cat: "one" },
    { x : 1950, value: 20, cat: "one" },
    { x : 2000, value: 22, cat: "one" },
    { x : 1900, value: 10, cat: "two" },
    { x : 1950, value: 20, cat: "two" },
    { x : 2000, value: 22, cat: "two" },
    { x : 2025, value: 23, cat: "two" },
    { x : 1950, value: 2, cat: "three" },
    { x : 2000, value: 8, cat: "three" }
  ];
}
