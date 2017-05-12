import {Component, Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'd3ng-tree-map-demo',
  template: `
    <h2>D3ng tree map Demo</h2>
    <div class="chart-container">
      <d3ng-tree-map d3ngSource [source]="source" pattern=".![.]" [(selected)]="selection" labelKey="name"></d3ng-tree-map>
    </div>
  `,
  styles: [ '.chart-container { height: 300px; }']
})

@Injectable()
export class D3ngTreeMapDemoComponent {
  source = [];

  constructor(http:Http) {
    http.get('/assets/tree-map-demo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.source = res;
      });
  }
}
