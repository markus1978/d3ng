import { Component } from '@angular/core';
import {Http, Response} from "@angular/http";
import * as d3 from "d3";

@Component({
  selector: 'd3ng-map-demos',
  template: `
    <h2>D3ng Map Demo</h2>
    <h3>A World Map</h3>
    <d3ng-map [data]="data" choropleth="value"></d3ng-map>
  `,
  styles: [ ]
})

export class D3ngMapDemoComponent {

  data = [];

  constructor(http: Http) {
    http.get('/assets/natural-population-growth.csv')
      .map((res: Response) => res)
      .subscribe(res => {
        this.data = d3.csv.parse(res.text()).filter(d=>d.year == 2005);
      });
  }
}
