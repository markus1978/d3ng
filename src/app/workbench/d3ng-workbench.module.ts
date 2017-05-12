import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgGridModule} from "angular2-grid";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdButtonModule, MdIconModule, MdInputModule, MdSelectModule, MdToolbarModule} from "@angular/material";
import {D3ngComponentsModule} from "../components/d3ng-components.module";
import {D3ngWorkbenchComponent} from "./d3ng-workbench.component";
import {D3ngWorkbenchItemComponent} from "./d3ng-workbench-item.component";
import {FormsModule} from "@angular/forms";
import { D3ngWorkbenchColumnComponent } from './d3ng-workbench-column.component';
import {TJsonViewerModule} from '../t-json-viewer/t-json-viewer.module';

@NgModule({
  declarations: [
    D3ngWorkbenchComponent,
    D3ngWorkbenchItemComponent,
    D3ngWorkbenchColumnComponent
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
