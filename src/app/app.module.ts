import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { D3ngListComponent } from './d3ng-list.component';
import { D3ngDemosComponent } from "./demos/d3ng-demos.component";
import { D3ngListDemoComponent } from "./demos/d3ng-list-demo.component";
import { D3ngPatternDemoComponent } from "./demos/d3ng-pattern-demo.component";

import { RouterModule } from '@angular/router';
import { D3ngParallelCoordinatesDemoComponent } from "./demos/d3ng-parallel-coordinates-demo.component";
import { D3ngParallelCoordinatesComponent } from "./d3ng-parallel-coordinates.component";
import {D3ngTreeMapComponent} from "./d3ng-tree-map.component";
import {D3ngTreeMapDemoComponent} from "./demos/d3ng-tree-map-demo.component";
import {D3ngChordDiagramComponent} from "./d3ng-chord-diagram.component";
import {D3ngChordDiagramDemoComponent} from "./demos/d3ng-chord-diagram-demo.component";
import {D3ngCodeVizComponent} from "./code-viz/d3ng-code-viz.component";
import {D3ngCollapsibleIndentedTreeComponent} from "./d3ng-collapsible-indented-tree.component";
import {D3ngCollapsibleIndentedTreeDemoComponent} from "./demos/d3ng-collapsible-indented-tree-demo.component";
import {D3ngScatterPlotComponent} from "./d3ng-scatter-plot.component";
import {D3ngScatterPlotDemoComponent} from "./demos/d3ng-scatter-plot-demo.component";

@NgModule({
  declarations: [
    AppComponent,
    D3ngListComponent,
    D3ngParallelCoordinatesComponent,
    D3ngScatterPlotComponent,
    D3ngTreeMapComponent,
    D3ngChordDiagramComponent,
    D3ngCollapsibleIndentedTreeComponent,
    D3ngDemosComponent,
    D3ngListDemoComponent,
    D3ngPatternDemoComponent,
    D3ngParallelCoordinatesDemoComponent,
    D3ngScatterPlotDemoComponent,
    D3ngTreeMapDemoComponent,
    D3ngChordDiagramDemoComponent,
    D3ngCollapsibleIndentedTreeDemoComponent,
    D3ngCodeVizComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: 'code-viz',
        component: D3ngCodeVizComponent
      },
      {
        path: 'demos',
        component: D3ngDemosComponent
      },
      {
        path: 'demos/list',
        component: D3ngListDemoComponent
      },
      {
        path: 'demos/pattern',
        component: D3ngPatternDemoComponent
      },
      {
        path: 'demos/parallel-coordinates',
        component: D3ngParallelCoordinatesDemoComponent
      },
      {
        path: 'demos/scatter-plot',
        component: D3ngScatterPlotDemoComponent
      },
      {
        path: 'demos/tree-map',
        component: D3ngTreeMapDemoComponent
      },
      {
        path: 'demos/collapsible-indented-tree',
        component: D3ngCollapsibleIndentedTreeDemoComponent
      },
      {
        path: 'demos/chord-diagram',
        component: D3ngChordDiagramDemoComponent
      },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
