'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './orders.routes';

export class OrdersComponent {
  /*@ngInject*/
  constructor(orders) {
    this.message = 'Hello';
    this.orders = orders;
    console.log("this.orders :",this.orders);
  }
}

export default angular.module('projectsApp.orders', [uiRouter])
  .config(routes)
  .component('orders', {
    template: require('./orders.html'),
    controller: OrdersComponent,
    controllerAs: 'ordersCtrl'
  })
  .name;
