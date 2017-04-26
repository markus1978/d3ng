import { Component } from '@angular/core';

@Component({
  selector: 'd3ng-scatter-plot-demo',
  template: `
    <h2>D3ng Scatter Plot Demo</h2>
    <d3ng-scatter-plot [data]="data" x="a" y="b" [(selected)]="selection"></d3ng-scatter-plot>
  `,
  styles: [ 'd3ng-scatter-plot { height : 300px; display:block; }' ]
})

export class D3ngScatterPlotDemoComponent {
  data = [
    { id: "a", a: 10, b: 20, c:5 },
    { id: "b", a: 12, b: 10, c:7 },
    { id: "c", a: 8, b: 15, c:14 },
    { id: "e", a: 2, b: 14, c:8 },
    { id: "f", a: 12.2, b: 11, c:3.2 },
  ]
}

