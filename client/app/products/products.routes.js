'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('products', {
      url: '/products',
      template: '<products></products>'
    });
}
