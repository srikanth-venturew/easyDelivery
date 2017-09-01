/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/orders              ->  index
 * POST    /api/orders              ->  create
 * GET     /api/orders/:id          ->  show
 * PUT     /api/orders/:id          ->  upsert
 * PATCH   /api/orders/:id          ->  patch
 * DELETE  /api/orders/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Order from './order.model';
import User from '../user/user.model';

var http_status = require('http-status-codes');


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function sendJSONresponse(res, status, content) {
  res.status(status);
  res.json(content);
};


function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Orders
export function index(req, res) {
    //console.log("params :",req.query);
  return Order.find(req.query).exec()
    .then(function(orders){
        //console.log("orders :",orders);
        sendJSONresponse(res, http_status.OK, {
            "status": "success",
            "message": "successfully obtained orders",
            "data":orders
        });
    })
    .catch(handleError(res));
}

// Gets a single Order from the DB
export function show(req, res) {
  //console.log('Finding order details', req.params);
    if (req.params && req.params.id) {
        Order
            .findById(req.params.id, {status:1,_id:0},function (err, order) {
                if (!order) {
                    sendJSONresponse(res, http_status.NOT_FOUND, {
                        "status":"failure",
                        "message": "no such order found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, http_status.INTERNAL_SERVER_ERROR, err);
                    return;
                }
                sendJSONresponse(res, http_status.OK, {
                    "status": "success",
                    "message": "successfully obtained status of the order",
                    "data":order
                });
            });
    } else {
        console.log('No orderid specified');
        sendJSONresponse(res, http_status.NOT_FOUND, {
            "status": "failure",
            "message": "No orderid in request"
        });
    }
}

// Creates a new Order in the DB
export function create(req, res) {

  // return Order.create(req.body)
  //   .then(respondWithResult(res, 201))
  //   .catch(handleError(res));
  if (req.body.deliveryModel && req.body.deliveryType && req.body.pickupAddress && req.body.deliveryAddress && req.body.requestedTime) {
        var pickupCoords;
        var deliveryCoords;
        var deliveryId;
        var googleMapsClient = req.app.get('googleMapsClient');
        Order.create({
            deliveryModel: req.body.deliveryModel,
            deliveryType: req.body.deliveryType,
            pickupAddress: req.body.pickupAddress,
            deliveryAddress: req.body.deliveryAddress,
            requestedTime: req.body.requestedTime
        }, function (err, order) {
            if (err) {
                res.status(http_status.INTERNAL_SERVER_ERROR);
                res.json({
                    "status": "failure",
                    "message": "error creating the order"
                });
            }
            else if (order) {
                deliveryId = order._id;
                sendJSONresponse(res, http_status.CREATED, {
                    "status": "success",
                    "message": "order successfully created",
                    "data":{
                        "deliveryId": deliveryId.toString()
                    }
                });
                googleMapsClient.geocode({
                    address: req.body.pickupAddress
                }, function (err, response) {
                    if (!err) {
                        pickupCoords = response.json.results[0].geometry.location;
                        console.log(pickupCoords);
                        googleMapsClient.geocode({
                            address: req.body.deliveryAddress
                        }, function (err, response) {
                            if (!err) {
                                deliveryCoords = response.json.results[0].geometry.location;
                                Order.findOneAndUpdate(
                                    {
                                        _id: deliveryId
                                    },
                                    {
                                        $set: {
                                            pickupCoords: [parseFloat(pickupCoords.lng), parseFloat(pickupCoords.lat)],
                                            deliveryCoords: [parseFloat(deliveryCoords.lng), parseFloat(deliveryCoords.lat)],
                                        }
                                    }, {
                                        new: true
                                    }
                                    , function (err, order) {
                                        if (err) {
                                            console.log('Error updating order document');
                                        }
                                        else if (order) {
                                            console.log("order successfully updated with coordinates :", order);
                                        }
                                    })
                            }
                        });

                    }
                });

            }
        });
    }
    else {
        res.status(http_status.NOT_FOUND);
        res.json({
            "status": "failure",
            "message": "some parameters are missing or case is not correct in request,please check."
        });
    }
}


//Assign an order to a runner :
//Method : POST 
//Accepts orderId , runnerId(userid) as parameters.
export function assignOrder(req,res){
    console.log("orderid :",req.body.orderid);
    console.log("userid :",req.body.userid);
    if(req.body.orderid && req.body.userid){
        Order.findById(req.body.orderid,function(err,order){
            if(err){
                console.log('error :',err);
            }
            if(!order){
                if(!user){
                    sendJSONresponse(res, http_status.FORBIDDEN, {
                        "status": "failure",
                        "message": "no order found with this id"
                    });        
                }
            }
            else if(order){
                console.log('order :',order);
                //check if the order is not assigned first 
                if(order.status == 'unassigned'){
                    User.findById(req.body.userid,function(err,user){
                        //check if the user is a "runner" , he is "free" and he set status to "on" in mobile
                        console.log('user :',user);
                        if(!user){
                            sendJSONresponse(res, http_status.FORBIDDEN, {
                                "status": "failure",
                                "message": "no user found with this id"
                            });        
                        }
                        else if(!user.runner || user.runner.status == 'atWork' || user.runner.appStatus == 'off'){
                            sendJSONresponse(res, http_status.FORBIDDEN, {
                                "status": "failure",
                                "message": "cannot assign to this runner , he is not available"
                            });        
                        }
                        else{
                            user.runner.status = 'atWork';
                            user.runner.deliveryId = order._id;
                            order.status = 'assigned';
                            user.save(function(err){
                                if(err){
                                    console.log('error saving user while adding task to him');
                                }
                            });
                            order.save(function(err){
                                if(err){
                                    console.log('error saving order while adding task to runner');
                                }
                            });
                            //Run any background tasks here:-
                            sendJSONresponse(res, http_status.OK, {
                                "status": "success",
                                "message": "task successfully assigned to runner"
                            });
                        }
                    });
                }
                else{
                    sendJSONresponse(res, http_status.FORBIDDEN, {
                        "status": "failure",
                        "message": "task is already assigned , cannot reassign it"
                    });
                }
            }
        })
    }
}

// Upserts the given Order in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Order.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Order in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Order.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Order from the DB
export function destroy(req, res) {
  return Order.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
