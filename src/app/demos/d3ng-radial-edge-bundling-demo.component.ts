import { Component } from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'd3ng-radial-edge-bundling-demo',
  template: `
    <h2>D3ng Radial Edge Bundling Demo</h2>
    <d3ng-radial-edge-bundling [source]="data" pattern="package/type" [(selected)]="selection"></d3ng-radial-edge-bundling>
  `,
  styles: [ 'd3ng-radial-edge-bundling { width : 600px; }' ]
})

export class D3ngRadialEdgeBundlingDemoComponent {
  data = {};

  constructor(http:Http) {
    http.get('/assets/de.hub.srcrepo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.data = res;
      });
  }
}
