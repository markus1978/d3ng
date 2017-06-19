# D3ng
D3ng is a web-based framework for interactive visual analysis of complex data-sets. It is build on top of **Angular2** and **D3.js**. It allows you to combine multiple individual visualizations (charts) with user interactions that allow to explore the relationships between the data shown in different visual representations.

Have a look at our example visualizations build with *d3ng* [here](http://d3ng.github.io/owid).

Some features of this READ.me work better in d3ng's [github page](http://github.com/markus1978/d3ng).

## Table of contents
1. [Getting started](#getting-started)
2. [Documentation](#documentation)
3. [Contributing](#contributing)
4. [License](#license)

## Getting started

Install the `d3ng` component library from `npm`:
```
npm install --save d3ng
```
Import the `D3ngComponentsModule` to your modules (e.g. `app.module.ts`):
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { D3ngComponentsModule } from 'd3ng';

@NgModule({
  imports: [
    BrowserModule,
    D3ngComponentsModule,
    ...
  ],
  ...
})
...
```
D3ng uses angular material and you should add a material theme to your `styles.css`:
```css
@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';
```
Refer to [Angular material docs](https://material.angular.io/guide/theming) to learn about other and your own custom themes. This step is optional, only some components use material.

Use your first d3ng component. For example:
```typescript
import {Component, Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import 'rxjs/Rx';
import * as d3 from "d3";

@Component({
  selector: 'app-root',
  template: `
    <d3ng-scatter-plot [data]="data" 
                       [dimensions]="dimensions">
    </d3ng-scatter-plot>`,
  styles: ['d3ng-scatter-plot { width: 400px; height: 300px; }']
})

@Injectable()
export class AppComponent {
  data: any[] = null;
  dimensions = ['sepal length',	'sepal width', 'petal length', 'petal width'];

  constructor(http: Http) {
    http.get("http://mbostock.github.io/d3/talk/20111116/iris.csv")
      .map((res: Response) => res)
      .subscribe(res => {
        this.data = d3.csv.parse(res.text()).map(d => {
          // convert data, since d3 creates strings and not numbers
          const result = {};
          this.dimensions.forEach(dim => result[dim] = parseFloat(d[dim]));
          return result;
        });
      });
  }
}
```

Add brushing and linking with the use if selection groups:
```html
<d3ng-groups [context]="context">
  <d3ng-scatter-plot [data]="data"
                     x="sepal length" y="sepal width"
                     [dimensions]="dimensions">
  </d3ng-scatter-plot>  
</d3ng-groups>

<d3ng-groups [context]="context">
  <d3ng-scatter-plot [data]="data"
                     x="petal length" y="petal width"
                     [dimensions]="dimensions">
  </d3ng-scatter-plot>
</d3ng-groups>
```

Don't forget to declare the group context:
```typescript
context = new D3ngGroupContext();
```

You can also look at or fork our [example and skeleton project](https//github.com/markus1978/d3ng.example) to get a working sandbox.

## Documentation

There is a generated API documentation of the d3ng component library [here](http://d3ng.github.io/documentation).

### Charts
D3ng contains components for various types of charts. Refer to our running [example app](http://d3ng.github.io/demos) for a list and source code snippets.

All charts define an input property called `data`. It accepts arrays at values, where each item represents a data point. Data-points are objects. We refer to their keys as `dimensions`. Many charts have a `string[]`property `dimensions` to declare those data-point keys that refer to representable data. 

Data-points can have a `label` key that is used to render titles. The label key can be customized by redefining `labelKey` or `getLabel`. 

To write new chart components, you have to inherit from `D3ngChart` and implements the `draw`, `clear` and `drawSelection` methods respectively. Thereby, you define how your chart is drawn, removed (before redrawn), and how the current selection is drawn onto the chart.

The simplest concrete chart component that you can use as a blue print is d3ng-list:
```typescript
import {Component, OnChanges, ViewChild} from "@angular/core";
import * as d3 from "d3";
import {D3ngChart, D3ngSelection} from "./d3ng-chart";

@Component({
  selector: 'd3ng-list',
  template: `
    <div #chart></div>`,
  styles: []
})

export class D3ngListComponent extends D3ngChart implements OnChanges {

  @ViewChild('chart') chart;

  private d3Chart = null;

  protected drawSelection(selection: D3ngSelection): void {
    if (this.d3Chart) {
      this.d3Chart.style("color", dataPoint => selection.selectionColor(dataPoint));
    }
  }

  protected clear() {
    // d3 is used to update the existing chart
  }

  protected draw() {
    const self = this;
    this.d3Chart = d3.select(this.chart.nativeElement)
      .selectAll("p")
      .data(this.data)
      .enter().append("p")
      .text(d => "# " + self.getLabel(d))
      .on("click", d => {
        self.setDirectSelection([ d ]);
      });
  }
}
```

### Selections and groups

D3ng implements brushing and linking via selections and selection groups. Users can select data in one chart (brushing) and their selection is displayed
in other related charts as well (linking).

There are several ways to combine charts via selection groups. Refer to the respective part in our demo app for examples and code snippits [here](http://d3ng.github.io/stories).

### Complex data and pattern

Imagine, you organised your complex multi modal, multi variant data as a complex json data structure.

The D3ngSource directive allows to use a *source* tree of different types of *data-points* and uses *patterns* to select data from sources. The directive defines the `source` property that takes an array of tree-nodes. Each node needs to define a `type` and can define `label` and `children` keys. 

Type needs to be a string, and children an array of child nodes.

Each node can define more keys to keep the actual data variables. All nodes of the same type, need to define the same data keys. 

Patterns of types can be used to select data from trees. Here is a simple example that selects all `class` typed nodes from a tree of `packages` and `classes, based on the given json data:
```typescript
<d3ng-scatter-plot [source]="source" pattern="package/type" 
                   [dimensions]="['WMC', 'RFC', 'LOC']">
</d3ng-scatter-plot>
 
source = [{
  type = "package",
  label = "example-project",
  children = [{
    type = "class",
    label = "HelloWorld",
    WMC = 5,
    LOC = 15,
    RFC = 3
  }, ...]
},...]
```

## Contributing

Is very much appreciated. Feel free to add bug reports and feature requests. If you have bug fixes, new charts, etc. pull requests welcome. Also, if you like d3ng, please share and spread the word!

### Requirments
1. node.js
2. npm
3. [angular-cli](https://github.com/angular/angular-cli/blob/master/README.md)
4. git

### Getting started

Clone (or fork and clone) the master branch:
```
git clone https://github.com/markus1978/d3ng.git
cd d3ng
```
Get all dependencies via `npm`:
```
npm update
```
Start the for dev server that hosts the example and demo app:
```
npm run start
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Add new chart components
1. See [documentation](#documentation) on writing chart components.
2. Add you chart component to the d3ng components module (`lib` and `lib/d3ng-components.module.ts`).
3. Add a demo component to the demo module (`app/demos` and `app/demos/d3ng-demos.module.ts`).
4. Add a routing link to the demos navigation in `app/demos/d3ng-demos.component.ts`. Add routing information to `demosRouting` in `app/demos/d3ng-demos.module.ts`.

### npm scripts

Run `ng build:app` to build the example and demo app. The build artifacts will be stored in the `dist/app` directory.

Run `ng build:lib` to build the component library as a npm package in `dist/lib`.

There are more scipts, have a look at `package.json`.

### Running unit tests

There are no tests yet :-(.

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

There are no tests yet :-(.

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## License

[MIT License](https://github.com/markus1978/d3ng/blob/master/LICENSE)

Copyright (c) 2017 Markus Scheidgen
