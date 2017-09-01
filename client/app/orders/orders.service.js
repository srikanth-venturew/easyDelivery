'use strict';
const angular = require('angular');

/*@ngInject*/
export function ordersService() {
	// AngularJS will instantiate a singleton by calling "new" on this function
  var orders = {

    getOrders(){
      [
        {
          "_id": "59a6a720bf4c0219482218ef",
          "updatedAt": "2017-08-31T13:17:58.761Z",
          "createdAt": "2017-08-30T11:53:04.076Z",
          "deliveryModel": "onDemand",
          "deliveryType": "cargo",
          "pickupAddress": "ayyappa society , madhapur",
          "deliveryAddress": "kphb colony , kukkattpally",
          "requestedTime": "2017-08-28T18:30:00.000Z",
          "__v": 0,
          "status": "assigned"
      },
      {
          "_id": "59a6b0df7ee56a0448e7c1a2",
          "updatedAt": "2017-08-30T12:34:39.351Z",
          "createdAt": "2017-08-30T12:34:39.351Z",
          "deliveryModel": "onDemand",
          "deliveryType": "cargo",
          "pickupAddress": "ayyappa society , madhapur",
          "deliveryAddress": "kphb colony , kukkattpally",
          "requestedTime": "2017-08-28T18:30:00.000Z",
          "__v": 0,
          "status": "unassigned"
      },
      {
          "_id": "59a6b1c28d99c1041cc36e26",
          "updatedAt": "2017-08-30T12:38:26.629Z",
          "createdAt": "2017-08-30T12:38:26.629Z",
          "deliveryModel": "onDemand",
          "deliveryType": "cargo",
          "pickupAddress": "ayyappa society , madhapur",
          "deliveryAddress": "kphb colony , kukkattpally",
          "requestedTime": "2017-08-28T18:30:00.000Z",
          "__v": 0,
          "status": "unassigned"
      },
      {
          "_id": "59a6b2253511e8115c99778d",
          "updatedAt": "2017-08-30T12:40:05.921Z",
          "createdAt": "2017-08-30T12:40:05.921Z",
          "deliveryModel": "onDemand",
          "deliveryType": "cargo",
          "pickupAddress": "ayyappa society , madhapur",
          "deliveryAddress": "kphb colony , kukkattpally",
          "requestedTime": "2017-08-28T18:30:00.000Z",
          "__v": 0,
          "status": "unassigned"
      },
      {
          "_id": "59a6b369b44cdc0a2c94a231",
          "updatedAt": "2017-08-30T12:46:04.596Z",
          "createdAt": "2017-08-30T12:45:29.654Z",
          "deliveryModel": "onDemand",
          "deliveryType": "cargo",
          "pickupAddress": "ayyappa society , madhapur",
          "deliveryAddress": "kphb colony , kukkattpally",
          "requestedTime": "2017-08-28T18:30:00.000Z",
          "__v": 0,
          "deliveryCoords": [
              78.3870668,
              17.4833526
          ],
          "pickupCoords": [
              78.39125729999999,
              17.4465579
          ],
          "status": "unassigned"
      }
      ]
    }

  }

  return orders;

}

export default angular.module('projectsApp.orders', [])
  .factory('orders', ordersService)
  .name;
