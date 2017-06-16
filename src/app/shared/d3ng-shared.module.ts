import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdButtonModule, MdIconModule, MdTabsModule} from "@angular/material";
import "hammerjs";
import {D3ngDemoViewer} from "./d3ng-demo-viewer.component";


@NgModule({
  declarations: [
    D3ngDemoViewer,
  ],
  imports: [
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdTabsModule,
    MdButtonModule,
    MdIconModule
  ],
  exports: [
    D3ngDemoViewer
  ]
})
export class D3ngShadredModule { }
