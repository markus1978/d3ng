import { Component } from '@angular/core';
import {D3ngChart} from "../d3ng-chart";

@Component({
  selector: 'd3ng-demos',
  template: `
    <h2>Demos</h2>
    <a routerLink="/demos/list">List</a>
    <a routerLink="/demos/pattern">Pattern</a>
    <a routerLink="/demos/parallel-coordinates">Parallel Coordinates</a>
  `,
  styles: [ ]
})

export class D3ngDemosComponent {

}
