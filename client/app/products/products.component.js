'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './products.routes';

export class ProductsComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('projectsApp.products', [uiRouter])
  .config(routes)
  .component('products', {
    template: require('./products.html'),
    controller: ProductsComponent,
    controllerAs: 'productsCtrl'
  })
  .name;
