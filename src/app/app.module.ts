import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdTabsModule} from "@angular/material";
import {D3ngDemosModule} from "./demos/d3ng-demos.module";
import {D3ngDemosComponent} from "./demos/d3ng-demos.component";
import {D3ngComponentsModule} from "./components/d3ng-components.module";
import {D3ngCodeVizComponent} from "./code-viz/d3ng-code-viz.component";
import {demosRouting} from "./demos/d3ng-demos.module";

import 'hammerjs';
import {D3ngWorkbenchComponent} from "./workbench/d3ng-workbench.component";
import {D3ngWorkbenchModule} from "./workbench/d3ng-workbench.module";

@NgModule({
  declarations: [
    AppComponent,
    D3ngCodeVizComponent,
  ],
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdTabsModule,
    FormsModule,
    HttpModule,
    D3ngDemosModule,
    D3ngComponentsModule,
    D3ngWorkbenchModule,
    RouterModule.forRoot([
      {
        path: 'code-viz',
        component: D3ngCodeVizComponent
      },
      {
        path: 'demos',
        component: D3ngDemosComponent,
        children: [...demosRouting]
      },
      {
        path: 'workbench',
        component: D3ngWorkbenchComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
