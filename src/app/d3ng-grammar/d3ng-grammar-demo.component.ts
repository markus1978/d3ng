import {Component} from "@angular/core";
import * as d3 from "d3";
import {Http, Response} from "@angular/http";
import * as moment from 'moment';

@Component({
  selector: 'd3ng-grammar-demo',
  templateUrl: './d3ng-grammar-demo.component.html',
  styles: [
    ":host /deep/ g.axis path { fill: none; stroke: #000; shape-rendering: crispEdges; }",
    ":host /deep/ g.axis line { fill: none; stroke: #000; shape-rendering: crispEdges; }",
    ":host /deep/ g.grid line { fill: none; stroke: #AAA; shape-rendering: crispEdges; }",
  ]
})
export class D3ngGrammarDemoComponent {

  data = [];

  constructor(http: Http) {
    http.get('/assets/seattle-weather.csv')
      .map((res: Response) => res)
      .subscribe(res => {
        this.data = d3.csv.parse(res.text());
      });
  }
}

