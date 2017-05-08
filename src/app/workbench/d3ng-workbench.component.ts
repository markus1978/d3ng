import {
  Component
} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'd3ng-workbench',
  templateUrl: './d3ng-workbench.component.html',
  styleUrls: ['./d3ng-workbench.component.css']
})
export class D3ngWorkbenchComponent {

  chart:any = null;
  config = {
    dimensions: ["WMC-1", "WMC-CC", "WMC-HV", "DIT", "NOC", "CBO", "RFC", "LCOM"],
    charts: [
      {
        type: "d3ng-scatter-plot",
        name: "Scatter plot",
        pattern: "root/package/type+",
        dimensionProperties: [{
          name:'x', value: 'WMC-1'
        }, {
          name:'y', value: 'RFC'
        }]
      },
      {
        type: "d3ng-parallel-coordinates",
        name: "Parallel coordinates",
        pattern: "root/package/type",
        dimensionProperties: []
      },
      {
        type: "d3ng-chord-diagram",
        name: "Chord diagram",
        pattern: "root/package[type]",
        dimensionProperties: []
      },
      {
        type: "d3ng-radial-edge-bundling",
        name: "Radial edge bundling",
        pattern: "root/package/type",
        dimensionProperties: []
      },
      {
        type: "d3ng-force-graph",
        name: "Force graph",
        pattern: "root/package/type",
        dimensionProperties: [{
          name:'nodeValue',
          value: 'WMC-1'
        }]
      },
      {
        type: "d3ng-tree-map",
        name: "Tree map",
        pattern: "root/package+/type",
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

  gridConfig = {
    resizeable: true,
    margins: [5,5]
  };
  items = [];
  data = {};

  constructor(http:Http) {
    this.chart = this.config.charts[0];
    http.get('/assets/de.hub.srcrepo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setData(res);
      });
  }

  private createGridItemConfig():any {
    return {
      sizex: 2,
      sizey: 2,
      borderSize: 5,
      resizeable: true,
      dragHandle: '.title'
    }
  }

  private addClicked() {
    const config = {
      component: this.chart.type,
      pattern: this.chart.pattern,
      dimensions: this.config.dimensions,
      scroll: this.chart.scroll
    };
    this.chart.dimensionProperties.forEach(dim=>{
      config[dim.name] = dim.value;
    });
    this.items.push({
      gridItemConfig: this.createGridItemConfig(),
      config: config,
      name: this.chart.name
    })
  }

  public removeItem(index:number) {
    this.items.splice(index, 1);
  }

  // code viz specific stuff
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
