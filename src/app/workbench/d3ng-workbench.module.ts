import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgGridModule} from "angular2-grid";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdButtonModule, MdIconModule, MdInputModule, MdSelectModule, MdToolbarModule} from "@angular/material";
import {D3ngComponentsModule} from "../../lib/d3ng.module";
import {D3ngWorkbenchComponent} from "./d3ng-workbench.component";
import {D3ngWorkbenchItemComponent} from "./d3ng-workbench-item.component";
import {FormsModule} from "@angular/forms";
import {TJsonViewerModule} from '../t-json-viewer/t-json-viewer.module';

@NgModule({
  declarations: [
    D3ngWorkbenchComponent,
    D3ngWorkbenchItemComponent
  ],
  imports: [
    CommonModule,
    BrowserModule, // before other material modules are imported
    BrowserAnimationsModule, // before other material modules are imported
    MdButtonModule,
    MdIconModule,
    MdToolbarModule,
    MdSelectModule,
    MdInputModule,
    NgGridModule,
    D3ngComponentsModule,
    FormsModule,
    TJsonViewerModule
  ],
  bootstrap: [ D3ngWorkbenchComponent ],
  providers: [],
  exports: [ D3ngWorkbenchComponent ]
})
export class D3ngWorkbenchModule { }
