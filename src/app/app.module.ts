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
import {D3ngComponentsModule} from "../lib/d3ng.module";
import {D3ngCodeVizComponent} from "./code-viz/d3ng-code-viz.component";
import {demosRouting} from "./demos/d3ng-demos.module";

import 'hammerjs';
import {D3ngWorkbenchComponent} from "./workbench/d3ng-workbench.component";
import {D3ngWorkbenchModule} from "./workbench/d3ng-workbench.module";
import {D3ngStoriesModule, storiesRouting} from "./stories/d3ng-stories.module";
import {D3ngStoriesComponent} from "./stories/d3ng-stories/d3ng-stories.component";
import { OwidComponent } from './owid/owid.component';
import { D3ngAboutComponent } from './d3ng-about.component';

@NgModule({
  declarations: [
    AppComponent,
    D3ngCodeVizComponent,
    OwidComponent,
    D3ngAboutComponent,
  ],
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdTabsModule,
    FormsModule,
    HttpModule,
    D3ngDemosModule,
    D3ngStoriesModule,
    D3ngComponentsModule,
    D3ngWorkbenchModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/about', pathMatch: 'full' },
      {
        path: 'about',
        component: D3ngAboutComponent
      },
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
        path: 'stories',
        component: D3ngStoriesComponent,
        children: [...storiesRouting]
      },
      {
        path: 'workbench',
        component: D3ngWorkbenchComponent
      },
      {
        path: 'owid',
        component: OwidComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
