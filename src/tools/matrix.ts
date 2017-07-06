export class Matrix {

  private arr: any[];

  static from(arr: any[]): Matrix {
    if (!arr || arr.length == 0) {
      throw new Error("Matrix must not be empty.");
    }
    const result = new Matrix();
    result.arr = arr;
    return result;
  }

  select(keys: string[]): Matrix {
    const result = this.arr.map(source => {
      const target = {};
      keys.forEach(key => target[key] = source[key]);
      return target;
    });
    return Matrix.from(result);
  }

  project(fromKeys: string[], toKeys: string[]): Matrix {
    fromKeys = fromKeys.slice(0);
    toKeys = toKeys.slice(0);
    Object.keys(this.arr[0]).filter(key => fromKeys.indexOf(key) == -1).forEach(key => {
      fromKeys.push(key);
      toKeys.push(key);
    });
    const result = this.arr.map(source => {
      const target = {};
      for (let i = 0; i < fromKeys.length; i++) {
        target[toKeys[i]] = source[fromKeys[i]];
      }
      return target;
    });
    return Matrix.from(result);
  }

  groupBy(keys: string[], groupedKey: string): Matrix {
    const keyKey = keys[0];
    const groupDict = [];
    const groups = [];
    this.arr.forEach(element => {
      const key = element[keyKey];
      let group = groupDict[key];
      if (!group) {
        group = {};
        group[groupedKey] = [];
        Object.keys(element)
          .filter(key => keys.indexOf(key) != -1)
          .forEach(key => group[key] = element[key]);
        groupDict[key] = group;
        groups.push(group);
      }

      const groupElement = {};
      Object.keys(element)
        .filter(key => keys.indexOf(key) == -1)
        .forEach(key => groupElement[key] = element[key]);
      group[groupedKey].push(groupElement);
    });
    return Matrix.from(groups);
  }

  zip(): any {
    const result = {};
    const keys = Object.keys(this.arr[0]);
    keys.forEach(key => result[key] = []);
    this.arr.forEach(element => keys.forEach(key => result[key].push(element[key])));
    return result;
  }

  unzip(columns?: string[]): Matrix {
    if (!columns) {
      columns = this.columns();
    }
    const zipColumn = columns[0];
    const results = [];
    this.arr.forEach(sourceRow => {
      const zipper = sourceRow[zipColumn];
      for (let i = 0; i < zipper.length; i++) {
        const targetRow = {};
        Object.keys(sourceRow).forEach(key => {
          if (columns.indexOf(key) == -1) {
            targetRow[key] = sourceRow[key];
          } else {
            targetRow[key] = sourceRow[key][i];
          }
        });
        results.push(targetRow);
      };
    });
    return Matrix.from(results);
  }

  columns(): string[] {
    return Object.keys(this.arr[0]);
  }

  filter(pred: (row: any) => boolean): Matrix {
    return Matrix.from(this.array().filter(pred));
  };

  array(): any[] {
    return this.arr;
  }
}
