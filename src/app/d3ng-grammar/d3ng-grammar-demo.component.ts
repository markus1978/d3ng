import {
  AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, Output,
  SimpleChanges
} from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: 'd3ng-grammer-demo',
  template: `
    <d3ng-chart [data]="data" style="height: 300px; display: block;">
      <svg:g d3ng-axis dimension="x" field="a"></svg:g>
      <svg:g d3ng-axis dimension="y" field="b"></svg:g>
      <!-- <svg:g d3ng-points x="a" y="b"></svg:g> -->
    </d3ng-chart>`,
  styles: []
})
export class D3ngGrammarDemoComponent {

  data = [
    { a: 1, b: 3, c: "a" },
    { a: 3, b: 2, c: "b" }
  ];
}

