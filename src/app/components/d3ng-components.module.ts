import {NgModule} from "@angular/core";
import {D3ngListComponent} from "./d3ng-list.component";
import {D3ngParallelCoordinatesComponent} from "./d3ng-parallel-coordinates.component";
import {D3ngScatterPlotComponent} from "./d3ng-scatter-plot.component";
import {D3ngTreeMapComponent} from "./d3ng-tree-map.component";
import {D3ngRadialEdgeBundlingComponent} from "./d3ng-radial-edge-bundling.component";
import {D3ngChordDiagramComponent} from "./d3ng-chord-diagram.component";
import {D3ngForceGraphComponent} from "./d3ng-force-graph.component";
import {D3ngCollapsibleIndentedTreeComponent} from "./d3ng-collapsible-indented-tree.component";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdSliderModule} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import 'hammerjs';

@NgModule({
  declarations: [
    D3ngListComponent,
    D3ngParallelCoordinatesComponent,
    D3ngScatterPlotComponent,
    D3ngTreeMapComponent,
    D3ngRadialEdgeBundlingComponent,
    D3ngChordDiagramComponent,
    D3ngForceGraphComponent,
    D3ngCollapsibleIndentedTreeComponent,
  ],
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdSliderModule,
    FormsModule,
    HttpModule
  ],
  exports: [
    D3ngListComponent,
    D3ngParallelCoordinatesComponent,
    D3ngScatterPlotComponent,
    D3ngTreeMapComponent,
    D3ngRadialEdgeBundlingComponent,
    D3ngChordDiagramComponent,
    D3ngForceGraphComponent,
    D3ngCollapsibleIndentedTreeComponent
  ]
})
export class D3ngComponentsModule { }

