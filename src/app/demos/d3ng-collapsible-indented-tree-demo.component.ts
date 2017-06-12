import {Component, Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'd3ng-collapsible-indented-tree-demo',
  template: `
    <h2>D3ng collapsible indented tree Demo</h2>
    <div class="chart-container">
      <d3ng-collapsible-indented-tree d3ngSource [source]="source" pattern="." [(selected)]="selection" labelKey="name"></d3ng-collapsible-indented-tree>
    </div>
  `,
  styles: [ ]
})

@Injectable()
export class D3ngCollapsibleIndentedTreeDemoComponent {
  selection: any[] = [];
  source = [];

  constructor(http:Http) {
    http.get('/assets/tree-map-demo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.source = res;
      });
  }
}
