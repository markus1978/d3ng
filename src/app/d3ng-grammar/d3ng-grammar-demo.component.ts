import {
  AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";

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

  data = [
    { a: 1, b: 3, c: 20 },
    { a: 3, b: 2, c: 60 }
  ];
}

