import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare var D3ngPatternParser: any;
import "./d3ng-pattern-parser";
import {D3ngChart} from "./d3ng-chart";

export abstract class D3ngDependencyChart extends D3ngChart {

  /**
   * The data object key that gives the numerical value.
   */
  @Input() valueKey:string = "value";

  /**
   * The data node key that gives an array of dependency objects.
   * Each dependency object has an id and a value (see `idKey` and
   * `valueKey`).
   */
  @Input() refKey: string = "dependencies";

  /**
   * The key used to identify or reference data objects.
   */
  @Input() idKey: string = "id";


  protected getValue(ref):Number {
    return ref[this.valueKey];
  }

  /**
   * Return the id of a given data node or dependency.
   */
  protected getId(node):string {
    return node[this.idKey];
}

  protected getDependencies(node):Array<any> {
    return node[this.refKey];
  }

  protected computeIndexGraphFromData(): any {
    return this.computeGraphFromData((index, obj)=>index);
  }

  protected computeObjectGraphFromData(): any {
    return this.computeGraphFromData((index, obj)=>obj);
  }

  private computeGraphFromData(ref:(Object,number)=>any):any {
    const self = this;
    const graph:any = {};
    graph.nodes = [];
    graph.links = [];
    const groupIds = {};
    let groupIdGenerator = 0;
    const indexes = {};

    this.data.forEach(d => {
      const id = self.getId(d);
      const group: any = self.getId(self.getParent(d));
      if (!groupIds[group]) {
        groupIds[group] = groupIdGenerator++;
      }

      indexes[id] = graph.nodes.length;
      graph.nodes.push({"id": id, "data": d, "group": groupIds[group]});
    });

    this.data.forEach(d => {
      const dependencies = self.getDependencies(d);
      if (dependencies) {
        dependencies.forEach(dep => {
          const targetIndex = indexes[self.getId(dep)];
          if (targetIndex) {
            graph.links.push({
              "source": ref(indexes[self.getId(d)],d),
              "target": ref(targetIndex, graph.nodes[targetIndex].data),
              "value": self.getValue(dep)
            });
          }
        });
      }
    });

    return graph;
  }
}
