import {Component, Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'd3ng-pattern-demo',
  template: `
    <h2>D3ng pattern Demo</h2>
    <d3ng-list [source]="source" pattern="root/package[!type]" [(selected)]="selection"></d3ng-list>
  `,
  styles: [ ]
})

@Injectable()
export class D3ngPatternDemoComponent {
  source = [];

  constructor(http:Http) {
    http.get('/assets/de.hub.srcrepo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        console.log(res);
        this.source = res;
      });
  }
}
