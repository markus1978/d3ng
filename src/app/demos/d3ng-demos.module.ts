import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {D3ngDemosComponent} from "./d3ng-demos.component";
import {D3ngListDemoComponent} from "./d3ng-list-demo.component";
import {D3ngParallelCoordinatesDemoComponent} from "./d3ng-parallel-coordinates-demo.component";
import {D3ngScatterPlotDemoComponent} from "./d3ng-scatter-plot-demo.component";
import {D3ngTreeMapDemoComponent} from "./d3ng-tree-map-demo.component";
import {D3ngPatternDemoComponent} from "./d3ng-pattern-demo.component";
import {D3ngRadialEdgeBundlingDemoComponent} from "./d3ng-radial-edge-bundling-demo.component";
import {D3ngChordDiagramDemoComponent} from "./d3ng-chord-diagram-demo.component";
import {D3ngForceGraphDemoComponent} from "./d3ng-force-graph-demo.component";
import {D3ngCollapsibleIndentedTreeDemoComponent} from "./d3ng-collapsible-indented-tree-demo.component";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdListModule, MdSidenavModule} from "@angular/material";
import 'hammerjs';
import {D3ngComponentsModule} from "../components/d3ng-components.module";

export const demosRouting: Routes = [
  {
    path: 'list',
    component: D3ngListDemoComponent
  },
  {
    path: 'pattern',
    component: D3ngPatternDemoComponent
  },
  {
    path: 'parallel-coordinates',
    component: D3ngParallelCoordinatesDemoComponent
  },
  {
    path: 'scatter-plot',
    component: D3ngScatterPlotDemoComponent
  },
  {
    path: 'tree-map',
    component: D3ngTreeMapDemoComponent
  },
  {
    path: 'collapsible-indented-tree',
    component: D3ngCollapsibleIndentedTreeDemoComponent
  },
  {
    path: 'chord-diagram',
    component: D3ngChordDiagramDemoComponent
  },
  {
    path: 'force-graph',
    component: D3ngForceGraphDemoComponent
  },
  {
    path: 'radial-edge-bundling',
    component: D3ngRadialEdgeBundlingDemoComponent
  }
];

@NgModule({
  declarations: [
    D3ngDemosComponent,
    D3ngListDemoComponent,
    D3ngChordDiagramDemoComponent,
    D3ngCollapsibleIndentedTreeDemoComponent,
    D3ngForceGraphDemoComponent,
    D3ngParallelCoordinatesDemoComponent,
    D3ngPatternDemoComponent,
    D3ngRadialEdgeBundlingDemoComponent,
    D3ngScatterPlotDemoComponent,
    D3ngTreeMapDemoComponent
  ],
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdListModule,
    MdSidenavModule,
    D3ngComponentsModule,
    RouterModule.forChild(demosRouting),
  ],
  exports: [
    RouterModule,
    D3ngDemosComponent,
  ],
  bootstrap: [D3ngDemosComponent],
  providers: [],
})
export class D3ngDemosModule { }
