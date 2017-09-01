'use strict';

describe('Component: OrdersComponent', function() {
  // load the controller's module
  beforeEach(module('projectsApp.orders'));

  var OrdersComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    OrdersComponent = $componentController('orders', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
