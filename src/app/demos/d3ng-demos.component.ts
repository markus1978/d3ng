import { Component } from '@angular/core';

@Component({
  selector: 'd3ng-demos',
  template: `
    <div class="container">
      <div class="nav">
        <md-list>
          <md-list-item><a routerLink="list">List</a></md-list-item>
          <md-list-item><a routerLink="pattern">Pattern</a></md-list-item>
          <md-list-item><a routerLink="parallel-coordinates">Parallel Coordinates</a></md-list-item>
          <md-list-item><a routerLink="scatter-plot">Scatter Plot</a></md-list-item>
          <md-list-item><a routerLink="tree-map">Tree Map</a></md-list-item>
          <md-list-item><a routerLink="chord-diagram">Chord Diagram</a></md-list-item>
          <md-list-item><a routerLink="radial-edge-bundling">Radial Edge Bundling</a></md-list-item>
          <md-list-item><a routerLink="force-graph">Force Graph</a></md-list-item>
          <md-list-item><a routerLink="collapsible-indented-tree">Collapsible Indented Tree</a></md-list-item>
          <md-list-item><a routerLink="histogram">Histogram</a></md-list-item>
        </md-list>
      </div>
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: [ './d3ng-demos.component.css']
})

export class D3ngDemosComponent {

}
