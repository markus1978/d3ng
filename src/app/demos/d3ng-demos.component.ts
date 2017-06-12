import { Component } from '@angular/core';

@Component({
  selector: 'd3ng-demos',
  template: `
    <div class="explanations">
      <p>
        D3ng uses <a href="http://d3.js">D3.js</a> to implement a variety of chart types. This pages demonstrates each individual chart type.
        For your own visualizations, you probably want to implement new chart types. To do so you only have to
        implement to methods. One drawing data with D3.js; and another one that add styling based on selections.
      </p>
    </div>
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
          <md-list-item><a routerLink="map">Map</a></md-list-item>
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
