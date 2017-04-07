import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{title}}</h1>
    <a routerLink="/demos">Demos</a>
    <a routerLink="/code-viz">CodeViz</a>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'D3ng – D3.js chart component library';
  theData = [ 'A', 'B', 'C' ];
  selection = [];
}
