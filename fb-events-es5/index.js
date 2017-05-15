'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _eventFields = require('./eventFields');

var _eventFields2 = _interopRequireDefault(_eventFields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getToken = function getToken() {
  var client_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : FACEBOOK_CLIENT_ID;
  var client_secret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : FACEBOOK_CLIENT_SECRET;

  return httpGet('https://graph.facebook.com/oauth/access_token', {
    client_id: client_id,
    client_secret: client_secret,
    grant_type: 'client_credentials'
  }).then(function (response) {
    return response.json();
  }).then(function (_ref) {
    var access_token = _ref.access_token;

    return access_token;
  });
};

var getLocationIds = function getLocationIds(access_token, options) {
  return httpGet('https://graph.facebook.com/v2.7/search', {
    type: 'place',
    center: options.lat + ',' + options.lon,
    distance: options.dist || 10000,
    limit: options.limit || 100,
    fields: 'id',
    access_token: access_token
  }).then(function (response) {
    return response.json();
  }).then(function (_ref2) {
    var data = _ref2.data;

    return data.map(function (_ref3) {
      var id = _ref3.id;
      return id;
    });
  });
};

var getEventsByLocations = function getEventsByLocations(access_token, locationIds, sinceDate) {
  var since = ((sinceDate || new Date()).getTime() / 1000).toFixed();

  return httpGet('https://graph.facebook.com/v2.7/', {
    ids: locationIds.join(','),
    fields: (0, _eventFields2.default)(since).join(","),
    access_token: access_token
  }).then(function (response) {
    return response.json();
  }).then(function (body) {
    return body;
  });
};

var groupIds = function groupIds(ids) {
  var groupSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

  if (ids.length > groupSize) {
    return ids.reduce(function (prev, next) {
      if (prev[prev.length - 1].length < groupSize) {
        prev[prev.length - 1].push(next);
      } else {
        prev.push([next]);
      }
      return prev;
    }, [[]]);
  } else {
    return [ids];
  }
};

var httpGet = function httpGet(url, params) {
  return (0, _nodeFetch2.default)(url + '?' + formatParams(params));
};

var formatParams = function formatParams(paramJson) {
  return Object.keys(paramJson).map(function (key) {
    return key + '=' + paramJson[key];
  }).join('&');
};

var getGroupedEventByLocations = function getGroupedEventByLocations(accessToken, locations) {
  locations = groupIds(locations);

  var response = {};
  var promise = Promise.resolve({});

  locations.forEach(function (locationGroup) {
    promise = promise.then(function (events) {
      response = Object.assign({}, response, events);
      return getEventsByLocations(accessToken, locationGroup);
    });
  });

  return promise.then(function (events) {
    return Object.assign({}, response, events);
  });
};

var FbEvents = function () {
  function FbEvents(client_id, client_secret) {
    _classCallCheck(this, FbEvents);

    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  _createClass(FbEvents, [{
    key: 'getAppToken',
    value: function getAppToken() {
      var _this = this;

      return getToken(this.client_id, this.client_secret).then(function (token) {
        _this.setToken(token);
        return token;
      });
    }
  }, {
    key: 'setToken',
    value: function setToken(token) {
      this.token = token;
      return Promise.resolve(token);
    }
  }, {
    key: 'getEvents',
    value: function getEvents(options) {
      var _this2 = this;

      return getLocationIds(this.token, options).then(function (locations) {
        return getGroupedEventByLocations(_this2.token, locations);
      }).then(function (unfilteredEvents) {
        if (options.filter) {
          return Object.keys(unfilteredEvents).map(function (key) {
            return unfilteredEvents[key];
          }).filter(function (_ref4) {
            var events = _ref4.events;
            return events;
          }).reduce(function (prev, next) {
            next.events.data.forEach(function (event) {
              event.venue = Object.assign({}, next);
              delete event.venue.events;
              prev.push(event);
            });
            return prev;
          }, []);
        }
        return Object.keys(unfilteredEvents).map(function (key) {
          return unfilteredEvents[key];
        });
      });
    }
  }]);

  return FbEvents;
}();

exports.default = FbEvents;