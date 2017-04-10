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

  /**
   * Retrieves the parent node for a given node. The default implementation uses "parent" as key.
   * @param node
   * @returns {any} null if there is no parent.
   */
  protected getParent(node: Object): Object {
    return node["parent"];
  }

  protected computeHiearchyRoot(): Object {
    if (!this.data || this.data.length == 0) {
      return undefined;
    }

    const self = this;
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

    this.data.forEach(dataPoint => rootOf(dataPoint));

    return root;
  }
}
