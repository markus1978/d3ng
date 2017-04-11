import { Component } from '@angular/core';
import {D3ngChart} from "../d3ng-chart";

@Component({
  selector: 'd3ng-parallel-coordinates-demo',
  template: `
    <h2>D3ng Parallel Coordinates Demo</h2>
    <d3ng-parallel-coordinates [data]="data" [dimensions]="[ 'a', 'b', 'c' ]" [(selected)]="selection"></d3ng-parallel-coordinates>
  `,
  styles: [ 'd3ng-parallel-coordinates { height : 300px; }' ]
})

export class D3ngParallelCoordinatesDemoComponent {
  data = [
    { id: "a", a: 10, b: 20, c:5 },
    { id: "b", a: 12, b: 10, c:7 },
    { id: "c", a: 8, b: 15, c:14 },
    { id: "e", a: 2, b: 14, c:8 },
    { id: "f", a: 12.2, b: 11, c:3.2 },
  ]
}
