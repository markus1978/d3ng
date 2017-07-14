import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3ngGrammarDemoComponent} from "./d3ng-grammar-demo.component";
import {ChartComponent} from "./chart.component";
import {AxisComponent} from "./axis.component";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ChartComponent,
    AxisComponent,
    D3ngGrammarDemoComponent
  ],
  exports: [
    D3ngGrammarDemoComponent
  ]
})
export class D3ngGrammarModule { }
