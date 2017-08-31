'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';


function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode).json({
      "status": "failure",
      "message": "User registration failed",
      "data": {
        "error": err.message
      }
    });
  };
}




function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    return res.status(statusCode).send(err);
  };
}

function sendJSONresponse(res, status, content) {
  res.status(status);
  res.json(content);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  if (!newUser.role) {
    newUser.role = 'user';
  }

  if (newUser.role == 'runner') {
    if (!newUser.runner) {
      newUser.runner = {};
      console.log("req.body :", req.body);
      if (req.body.workType) {
        newUser.runner.workType = req.body.workType;
      }
    }
  }

  newUser.save()
    .then(function (user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      sendJSONresponse(res, 200, {
        "status": "success",
        "message": "User successfully created",
        "data": {
          "token": token
        }
      });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}


// Updates an existing User in the DB
export function patch(req, res) {
  User.findByIdAndUpdate(req.params.id,
    {
      $set: {
        "runner": req.body.runner
      }
    }, { new: true }, function (err, user) {
      if (err) {
        sendJSONresponse(res, 200, {
          "status": "failure",
          "message": "User updated failed",
        });
      }
      else {
        sendJSONresponse(res, 200, {
          "status": "success",
          "message": "User successfully updated",
        });
      }
    })
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

