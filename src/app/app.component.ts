import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `    
    <!--<a routerLink="/demos">Demos</a>
    <a routerLink="/code-viz">CodeViz</a>-->
    
    <nav md-tab-nav-bar>
      <a md-tab-link
         *ngFor="let link of navLinks"
         [routerLink]="link.path"
         routerLinkActive #rla="routerLinkActive"
         [active]="rla.isActive">
        {{link.label}}
      </a>
    </nav>

    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'D3ng – D3.js chart component library';
  navLinks = [
    {
      path : '/demos',
      label : 'Demos'
    },
    {
      path : '/code-viz',
      label: 'CodeViz'
    },
    {
      path: '/stories',
      label: 'Stories'
    },
    {
      path : '/workbench',
      label: 'Workbench'
    }
  ];
  selection = [];
}
