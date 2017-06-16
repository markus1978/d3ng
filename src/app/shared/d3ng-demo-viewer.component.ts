import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Http} from "@angular/http";

@Component({
  selector: 'd3ng-demo-viewer',
  template: `
    <div class="container">
      <div class="controls">
        <button style="color: #555" md-icon-button (click)="showSource = !showSource" title="Show source">
          <md-icon>code</md-icon>
        </button>
      </div>
      <div class="sources" *ngIf="showSource && availableTypes().length > 0">
        <md-tab-group>
          <md-tab *ngFor="let key of availableTypes()" [label]="key">
            <div class="source-container">
              <pre [innerHTML]="source[key]"></pre>
            </div>
          </md-tab>
        </md-tab-group>
      </div>
      <div class="demo-container">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    '.container { border: solid 1px #ccc }',
    '.controls { background: #ccc; padding: 10px; }',
    '.sources { border-bottom: solid 1px #ccc }',
    '.source-container { padding: 10px }',
    '.demo-container { padding: 10px }'
  ]
})
export class D3ngDemoViewer implements OnChanges {
  @Input() sourceBasePath: string = null;

  sourceTypes = [ 'html', 'css', 'ts' ];
  source = {};
  showSource = false;

  availableTypes(): string[] {
    return this.sourceTypes.filter(type => this.source[type]);
  }

  private onSourceBasePathChanged() {
    this.sourceTypes.forEach(type => {
      const demoUrl = `${this.sourceBasePath}-${type}.html`;
      this.http.get(demoUrl).map(response => response.text())
        .subscribe(html => this.source[type] = html, (err) => this.source[type] = null);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("sourceBasePath")) {
      this.onSourceBasePathChanged();
    }
  }

  constructor(private http: Http) {}
}

