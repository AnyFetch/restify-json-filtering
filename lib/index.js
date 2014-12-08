'use strict';

function removeFields(body, fields) {
  var fieldsArray = Object.keys(fields);

  if(fieldsArray.length === 0) {
    return;
  }

  if(Array.isArray(body)) {
    return body.forEach(function(obj) {
      return removeFields(obj, fields);
    });
  }

  Object.keys(body).forEach(function(field) {
    if(fieldsArray.indexOf(field) === -1) {
      delete body[field];
      return;
    }

    return removeFields(body[field], fields[field]);
  });
}

module.exports = function(paramName) {
  return function(req, res, body) {
    if(body instanceof Error) {
      if(body.body) {
        return JSON.stringify(body.body);
      }

      res.statusCode = 500;
      return JSON.stringify({message: body.message});
    }

    if(!req.params[paramName]) {
      return JSON.stringify(body);
    }

    var fields = {};

    req.params[paramName].replace(/ /g, '').split(',').forEach(function(field) {
      field = field.split('.');

      var obj = fields;
      field.forEach(function(fieldName) {
        if(!obj[fieldName]) {
          obj[fieldName] = {};
        }

        obj = obj[fieldName];
      });
    });

    removeFields(body, fields);
    return JSON.stringify(body);
  };
};

// For testing purposes
module.exports.removeFields = removeFields;
