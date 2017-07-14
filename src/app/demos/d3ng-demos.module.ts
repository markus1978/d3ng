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
import {
  MdButtonModule,
  MdButtonToggleModule, MdCardModule, MdIconModule, MdListModule, MdSidenavModule,
  MdTabsModule
} from "@angular/material";
import 'hammerjs';
import {D3ngComponentsModule} from "../../lib/d3ng.module";
import {D3ngHistogramDemoComponent} from "./d3ng-histogram-demo.component";
import {D3ngMapDemoComponent} from "./d3ng-map-demo.component";
import {D3ngShadredModule} from "../shared/d3ng-shared.module";
import {D3ngBubbleHistogramDemoComponent} from "./d3ng-bubble-histogram-demo.component";
import {D3ngPathPlotComponent} from "../../lib/d3ng-path-plot.component";
import {D3ngPathPlotDemoComponent} from "./d3ng-path-plot-demo.component";
import {D3ngGrammarModule} from "../d3ng-grammar/d3ng-grammar.module";
import {D3ngGrammarDemoComponent} from "../d3ng-grammar/d3ng-grammar-demo.component";

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
    path: 'path-plot',
    component: D3ngPathPlotDemoComponent
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
  },
  {
    path: 'histogram',
    component: D3ngHistogramDemoComponent
  },
  {
    path: 'map',
    component: D3ngMapDemoComponent
  },
  {
    path: 'bubble-histogram',
    component: D3ngBubbleHistogramDemoComponent
  },
  {
    path: 'grammar',
    component: D3ngGrammarDemoComponent
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
    D3ngTreeMapDemoComponent,
    D3ngHistogramDemoComponent,
    D3ngMapDemoComponent,
    D3ngBubbleHistogramDemoComponent,
    D3ngPathPlotDemoComponent
  ],
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdListModule,
    MdSidenavModule,
    D3ngShadredModule,
    D3ngComponentsModule,
    RouterModule.forChild(demosRouting),
    D3ngGrammarModule,
  ],
  exports: [
    RouterModule,
    D3ngDemosComponent,
  ],
  bootstrap: [D3ngDemosComponent],
  providers: [],
})
export class D3ngDemosModule { }
