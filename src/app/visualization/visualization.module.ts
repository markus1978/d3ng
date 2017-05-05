import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgGridModule} from "angular2-grid";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {VisualizationComponent} from "./visualization.component";
import {MdButtonModule, MdIconModule, MdToolbarModule} from "@angular/material";
import {D3ngVisualizationItemComponent} from "./d3ng-visualization-item.component";

@NgModule({
  declarations: [
    VisualizationComponent,
    D3ngVisualizationItemComponent
  ],
  imports: [
    CommonModule,
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdButtonModule,
    MdIconModule,
    MdToolbarModule,
    NgGridModule
  ],
  bootstrap: [ VisualizationComponent ],
  providers: [],
  exports: [ VisualizationComponent ],
  entryComponents: [ D3ngVisualizationItemComponent ]
})
export class VisualizationModule { }
