import {Variable} from "./variables";

export abstract class ChartElement {
  abstract registerLayout(registry: (orientation: LayoutOrientation, size: number) => any): void;
  abstract layout(dimensions: LayoutDimensions): void;

  abstract registerVariables(registry: (spec: any) => Variable);
  abstract render(data: Object[]);
}

export enum LayoutOrientation { top, bottom, left, right, content, chart }

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

