import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3ngGrammarDemoComponent} from "./d3ng-grammar-demo.component";
import {ChartDirective} from "./chart.directive";
import {AxisDirective} from "./axis.directive";
import {CircleMarkDirective} from "./circle-mark.directive";
import {GridDirective} from "./grid.directive";
import {BarMarkDirective} from "./bar-mark.directive";
import {LineMarkDirective} from "./line-mark.directive";
import {D3ngComponentsModule} from "../../lib/d3ng.module";

@NgModule({
  imports: [
    CommonModule,
    D3ngComponentsModule
  ],
  declarations: [
    ChartDirective,
    AxisDirective,
    CircleMarkDirective,
    GridDirective,
    BarMarkDirective,
    LineMarkDirective,
    D3ngGrammarDemoComponent
  ],
  exports: [
    D3ngGrammarDemoComponent
  ]
})
export class D3ngGrammarModule { }
