import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3ngGrammarDemoComponent} from "./d3ng-grammar-demo.component";
import {ChartDirective} from "./chart.directive";
import {AxisDirective} from "./axis.directive";
import {CircleMarkDirective} from "./circle-mark.directive";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ChartDirective,
    AxisDirective,
    CircleMarkDirective,
    D3ngGrammarDemoComponent
  ],
  exports: [
    D3ngGrammarDemoComponent
  ]
})
export class D3ngGrammarModule { }
