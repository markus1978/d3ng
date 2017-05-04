import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgGridModule} from "angular2-grid";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {VisualizationComponent} from "./visualization.component";

@NgModule({
  declarations: [
    VisualizationComponent
  ],
  imports: [
    CommonModule,
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    NgGridModule
  ],
  bootstrap: [ VisualizationComponent ],
  providers: [],
  exports: [ VisualizationComponent ]
})
export class VisualizationModule { }
