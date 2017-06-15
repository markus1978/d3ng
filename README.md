# D3ng
D3ng is a web-based framework for interactive visual analysis of complex data-sets. It is build on top of Angular2 and D3.js. It allows you to combine multiple individual visualizations (charts) with user interactions that allow to explore the relationships between the data shown in different visual representations.

Have a look at our example visualizations build with *d3ng* [here](http://d3ng.github.io/owid).

# Getting started with using d3ng

## You do not already have a Angular 2 app?

Use the [d3ng.example](httpss//github.com/markus1978/d3ng.example) project as a scaffold.

## You are already have an Angular 2 app? 

First, add the dependency with `npm install --save d3ng`.

Secondly, d3ng uses angular material and you need to add `@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';` to your global `styles.css`. Off course you can use other themes. Refer to [Angular material docs](https://material.angular.io/guide/theming) for details.

Thirdly, import the module `D3ngComponentsModule` in your `app.modules.ts`.
 
Lastly, start using it in your components! Look at our example components for [software visualization](https://github.com/markus1978/d3ng/tree/master/src/app/code-viz) and [Our World in Data](https://github.com/markus1978/d3ng/tree/master/src/app/owid), or our component demos components [here](https://github.com/markus1978/d3ng/tree/master/src/app/demos).

# Getting started with developing d3ng

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server for the demo app

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build:app` to build the example and demo app. The build artifacts will be stored in the `dist/app` directory.

Run `ng build:lib` to build the component library as a npm package in `dist/lib`.

## Running unit tests

There are no tests yet :-(.

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

There are no tests yet :-(.

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
