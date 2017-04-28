import {EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";

declare var D3ngPatternParser: any;
import "./d3ng-pattern-parser";
import {D3ngChart} from "./d3ng-chart";

export abstract class D3ngHierarchicalChart extends D3ngChart {

  /**
   * @param node to compute the value for
   * @returns {number} the value associated with the given node. Default is 1.
   */
  protected getValue(node: Object): Number {
    return 1;
  }

  public static computeHierarchyRoot(self: D3ngChart, data: Array<any>): Object {
    if (!data || data.length == 0) {
      return undefined;
    }

    const knownRoots = {};
    let root = null;

    const rootOf = dataPoint => {
      if (!knownRoots[dataPoint]) {
        var parent = self.getParent(dataPoint);
        if (parent) {
          knownRoots[dataPoint] = rootOf(parent)
        } else {
          if (root == null) {
            root = dataPoint;
            knownRoots[dataPoint] = root;
          } else {
            throw new Error("Hierarchy data has more than one root.");
          }
        }
      }
      return knownRoots[dataPoint];
    }

    data.forEach(dataPoint => rootOf(dataPoint));

    return root;
  }

  protected computeHierarchyRoot(): Object {
    return D3ngHierarchicalChart.computeHierarchyRoot(this, this.data);
  }
}
