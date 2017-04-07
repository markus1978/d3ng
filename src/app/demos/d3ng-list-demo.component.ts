import { Component } from '@angular/core';
import {D3ngChart} from "../d3ng-chart";

@Component({
  selector: 'd3ng-list-demos',
  template: `
    <h2>D3ng List Demo</h2>
    <h3>A list</h3>
    <d3ng-list [data]="listData" [(selected)]="selection" [customLabel]="label"></d3ng-list>
    <h3>A list connected with the other list</h3>
    <d3ng-list [data]="listData" [(selected)]="selection" [customLabel]="label"></d3ng-list>
  `,
  styles: [ ]
})

export class D3ngListDemoComponent {
  label = function(d) {
    return d;
  }

  listData = [
    "One",
    "Two",
    "Three",
    "Four"
  ]
}
