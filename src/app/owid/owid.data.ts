export interface OWIDMetaDataNode {  // root, groups, pages, variables
  type: string;
  key: string;
  title: string;
  url?: string;
  children?: OWIDMetaDataNode[];
  dataSetRefs?: string[];
}

export interface OWIDVariableMetaData extends OWIDMetaDataNode {
  key: string;
  description: string;
  dataUrl: string;
  dataFile: string;
  allDataSetRefs: string[]; // one variable can be contained in multiple data sets multiple times (hopefully its always the same? We use the larges anyways.)
  years: number[];
  valuesPerYear: number[];
}

export interface OWIDVariableData {
  key: string;
  countries: [{
    code: string;
    label: string;
    years: number[];
    values: number[];
  }];
}

export function treeForEach<T extends {children?: T[]}>(root: T, func: (T) => void): void {
  const visit = (node: T) => {
    func(node);
    if (node.children) {
      node.children.forEach(child => visit(child));
    }
  };
  visit(root);
}

export function treeFilter<T extends {children?: T[]}>(root: T, pred: (T) => boolean): T[] {
  const result: T[] = [];
  const visit = (node: T) => {
    if (pred(node)) {
      result.push(node);
    }
    if (node.children) {
      node.children.forEach(child => visit(child));
    }
  };
  visit(root);
  return result;
}

