import {Component, Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'd3ng-code-viz',
  template: `
    <h2>D3ng Code Viz</h2>
    <d3ng-collapsible-indented-tree [source]="data" pattern="." rootLabel="Data" 
                                    [(selected)]="selection"></d3ng-collapsible-indented-tree>
    <d3ng-parallel-coordinates style="height: 300px"
                               [source]="data" pattern="root/package/type+" 
                               [(selected)]="selection" 
                               [dimensions]='typeMetrics'></d3ng-parallel-coordinates>
    <d3ng-scatter-plot style="height: 300px;"
                       [source]="data" pattern="root/package/type+"
                       [(selected)]="selection"
                       x="WMC-CC" y="RFC" [dimensions]='typeMetrics'></d3ng-scatter-plot>
    
    <d3ng-chord-diagram style="width: 450px" 
                        [source]="data" pattern="root/package[type]" 
                        [(selected)]="selection"></d3ng-chord-diagram>
    <d3ng-radial-edge-bundling style="width: 600px;"
                        [source]="data" pattern="root/package/type"
                        [(selected)]="selection"></d3ng-radial-edge-bundling>
    <d3ng-force-graph style="width: 400px; height: 600px"
                        [source]="data" pattern="root/package/type"
                        [(selected)]="selection"></d3ng-force-graph>

    <d3ng-tree-map style="height: 400px"
                   [source]="data" pattern="root/package+/type" 
                   [(selected)]="selection"></d3ng-tree-map>
    
    <d3ng-list [source]="data" pattern="root/package/type" [(selected)]="selection"></d3ng-list>
  `,
  styles: [ ]
})

@Injectable()
export class D3ngCodeVizComponent {
  data = {};
  typeMetrics = ["WMC-1", "WMC-CC", "WMC-HV", "DIT", "NOC", "CBO", "RFC", "LCOM"];

  constructor(http:Http) {
    http.get('/assets/de.hub.srcrepo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setData(res);
      });
  }

  private setData(data) {
    if (data) {
      // this.types = this.aggregateTypes(this.data);
      const pkgs = this.aggregatePackageDependencies(data);
      this.normalizePackageDependencies(pkgs);
      this.data = data;
    }
  }

  private aggregatePackageDependencies(data):Array<any> {
    const pkgs = [];
    function visit(element) {
      if (element.type == "package" && element.children) {
        const dMap = {};
        element.children.filter(function(c) { return c.type == "type"}).forEach(function(c) {
          if (c.dependencies) {
            c.dependencies.forEach(function(d) {
              const pkgId = d.id.substring(0, d.id.lastIndexOf("/"));
              if (dMap[pkgId]) {
                dMap[pkgId] = dMap[pkgId] + d.value;
              } else {
                dMap[pkgId] = d.value;
              }
            });
          }
        });
        if (Object.keys(dMap).length != 0) {
          element.dependencies = [];
          for (let key in dMap) {
            if (dMap.hasOwnProperty(key)) {
              element.dependencies.push({
                "id": key,
                "value": dMap[key]
              });
            }
          }
          pkgs.push(element);
        }
      }

      if (element.children) {
        element.children.forEach(function(child) {
          visit(child);
        })
      }
    }
    visit(data);
    return pkgs;
  }

  private normalizePackageDependencies(pkgs:Array<any>) {
    const pMap = {};
    pkgs.forEach(function(p) {
      pMap[p.id] = p;
    });
    pkgs.forEach(function(p) {
      if (p.dependencies) {
        p.dependencies.forEach(function(d) {
          if (pMap[d.id]) {
            if (!pMap[d.id].dependencies) {
              pMap[d.id].dependencies = []
            }
            let otherD = pMap[d.id].dependencies.find(function(dd) { return dd.id == p.id; });
            if (!otherD) {
              otherD = { "id": p.id, "value": 0};
              pMap[d.id].dependencies.push(otherD);
            }
            otherD.value += d.value;
          }
        });
      }
    });
  }
}
