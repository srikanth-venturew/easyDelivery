'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('orders', {
      url: '/orders',
      template: '<orders></orders>'
    });
}



