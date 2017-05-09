import {
  Component, QueryList, ViewChildren
} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';
import {D3ngWorkbenchColumnComponent} from "./d3ng-workbench-column.component";

@Component({
  selector: 'd3ng-workbench',
  templateUrl: './d3ng-workbench.component.html',
  styleUrls: ['./d3ng-workbench.component.css']
})
export class D3ngWorkbenchComponent {

  config = {
    dimensions: ["WMC-1", "WMC-CC", "WMC-HV", "DIT", "NOC", "CBO", "RFC", "LCOM"],
    charts: [
      {
        type: "d3ng-scatter-plot",
        name: "Scatter plot",
        pattern: "package/type+",
        dimensionProperties: [{
          name:'x', value: 'WMC-1'
        }, {
          name:'y', value: 'RFC'
        }]
      },
      {
        type: "d3ng-parallel-coordinates",
        name: "Parallel coordinates",
        pattern: "package/type",
        dimensionProperties: []
      },
      {
        type: "d3ng-chord-diagram",
        name: "Chord diagram",
        pattern: "package[type]",
        dimensionProperties: []
      },
      {
        type: "d3ng-radial-edge-bundling",
        name: "Radial edge bundling",
        pattern: "package/type",
        dimensionProperties: []
      },
      {
        type: "d3ng-force-graph",
        name: "Force graph",
        pattern: "package/type",
        dimensionProperties: [{
          name:'nodeValue',
          value: 'WMC-1'
        }]
      },
      {
        type: "d3ng-tree-map",
        name: "Tree map",
        pattern: "package+/type",
        dimensionProperties: [{
          name:'value',
          value: 'WMC-1'
        }]
      },
      {
        type: "d3ng-collapsible-indented-tree",
        name: "Collapsible tree",
        pattern: ".",
        dimensionProperties: [],
        scroll: true
      }
    ]
  };

  @ViewChildren('column') columns:QueryList<D3ngWorkbenchColumnComponent>;
  sources: Array<any> = [];

  constructor(http:Http) {
    http.get('/assets/de.hub.srcrepo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setData(res);
      });
  }

  private addClicked():void {
    const newSource = this.columns.last.selection;
    this.sources.push(newSource);
  }

  private onSelectedChanged(event:any, index:number): void {
    if (index+1 < this.columns.length) {
      this.columns.find((c,i)=> i==index + 1).selection = event.value;
    }
  }

  // code viz specific stuff
  private setData(data) {
    if (data) {
      data.forEach(data => {
        const pkgs = this.aggregatePackageDependencies(data);
        this.normalizePackageDependencies(pkgs);
      })
      this.sources = [data];
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
