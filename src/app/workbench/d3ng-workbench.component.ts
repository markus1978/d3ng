import {
  Component, ViewChild, ViewContainerRef
} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';
import {D3ngGroupSelectionComponent} from "../components/d3ng-groups-selection.component";
import {D3ngGroupContext} from "../components/d3ng-groups.component";

@Component({
  selector: 'd3ng-workbench',
  templateUrl: './d3ng-workbench.component.html',
  styleUrls: ['./d3ng-workbench.component.css']
})
export class D3ngWorkbenchComponent {

  gridConfig = {
    resizeable: true,
    margins: [5,5],
    col_width: 170,
    row_height: 170,
  };

  chartsConfig = {
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

  data: any = null;  // the global remote data
  source: Array<any> = []; // the current source shown as JSON
  sourceGroup = -1; // the group used for the current source, -1 for the remote/global data as source
  code: string = ""; // the current value of the pattern
  target: any; // the current data calculated from current source and pattern. only to show the JSON

  chartConfig: any;
  items = []; // the items on the workbench

  availableGroups: number[] = []; // the groups shown as a source
  groups = [0,1,2,3]; // the groups that exist at all
  groupChildren: any[][] = [[],[],[],[]]; // the items with data based on a groups selection
  groupMember: any[][] = [[],[],[],[]]; // the items that belong to a group
  selectableGroups = [0,1,2,3]; // the groups available to add an item to based on the currently selected source

  context = new D3ngGroupContext();

  @ViewChild('groupSelection') groupSelection: D3ngGroupSelectionComponent;

  constructor(http:Http) {
    http.get('/assets/de.hub.srcrepo.json')
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.setData(res);
      });

    let index = 0;
    this.context.groups.forEach(group => {
      const groupIndex = index++;
      group.subscribe(selected => {
        this.onSelectedChanged(groupIndex, selected);
      });
    })
  }

  addChart():void {
    const groups = Array.from(this.groupSelection.values);
    const item = {
      gridItemConfig: this.createGridItemConfig(),
      chartConfig: {
        component: this.chartConfig.type,
        dimensions: this.chartsConfig.dimensions,
        scroll: this.chartConfig.scroll
      },
      name: this.chartConfig.type,
      groups: groups, // the groups this item belongs to
      parentGroup: this.sourceGroup, // the group this items data is based on (the selection of that group is the data)
      source: this.source, // the data source for this item (based on parentGroup or global)
      pattern: this.code, // the pattern for this item
    };

    this.chartConfig.dimensionProperties.forEach(dim => {
      item.chartConfig[dim.name] = dim.value;
    });

    this.items.push(item);

    // compute groups available for source and add to group members
    groups.forEach(group => {
      if (this.availableGroups.indexOf(group) == -1) {
        this.availableGroups.push(group);
      }
      this.groupMember[group].push(item);
    })

    // update group children
    if (item.parentGroup != -1) {
      this.groupChildren[this.sourceGroup].push(item);
    }
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

  public removeItem(index:number) {
    const item = this.items[index];
    this.items.splice(index, 1);

    // update group children
    if (item.parentGroup != -1) {
      this.groupChildren[item.parentGroup].splice(this.groupChildren[item.parentGroup].indexOf(item), 1);
    }

    // update group member and groups available as source
    item.groups.forEach(group => {
      const member = this.groupMember[group];
      member.splice(member.indexOf(item), 1);
      if (member.length == 0) {
        this.availableGroups.splice(this.availableGroups.indexOf(group), 1);
      }
    });
  }

  onSelectedChanged(group: number, selected: any[]) {
    if (this.sourceGroup == group) {
      this.source = selected;
    }

    this.groupChildren[group].forEach(item => {
      item.source = selected;
    });
  }

  onSourceGroupChanged(group: number) {
    this.sourceGroup = group;
    const selectableGroups = Array.from(this.groups);
    if (group == -1) {
      this.source = this.data;
    } else {
      this.source = this.context.groups[group].getSelected();
      selectableGroups.splice(group, 1);
    }
    this.selectableGroups = selectableGroups;
  }

  // code viz specific stuff
  private setData(data) {
    if (data) {
      data.forEach(data => {
        const pkgs = this.aggregatePackageDependencies(data);
        this.normalizePackageDependencies(pkgs);
      })
      this.source = data;
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
