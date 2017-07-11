import { Component } from '@angular/core';
import {Path} from "../../lib/d3ng-path-plot.component";

@Component({
  selector: 'd3ng-path-plot-demo',
  template: `
    <h2>D3ng Path Plot Demo</h2>
    <d3ng-path-plot [data]="data" [dimensions]="dimensions" [path]="path"></d3ng-path-plot>
  `,
  styles: [ 'd3ng-path-plot { height : 300px; display:block; }' ]
})

export class D3ngPathPlotDemoComponent {

  dimensions = [ "a", "b" ];

  data = [
    { id: "a", a: 10, b: 20, c: 5 },
    { id: "b", a: 12, b: 10, c: 7 },
    { id: "c", a: 8, b: 15, c: 14 },
    { id: "e", a: 2, b: 14, c: 8 },
    { id: "f", a: 12.2, b: 11, c: 3.2 },
  ];

  path: ((datum: any, xdim, ydim) => Path) = (datum, xdim, ydim) => {
    return [1, 2, 3, 4, 5].map(x => {
      return {
        x: x,
        y: datum[xdim] * x,
        label: "" + datum[ydim]
      };
    });
  }

}

