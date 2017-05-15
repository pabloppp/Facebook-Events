import fetch from 'node-fetch';
import eventsFields from './eventFields';

const getToken = (client_id = FACEBOOK_CLIENT_ID, client_secret = FACEBOOK_CLIENT_SECRET) => {
  return httpGet('https://graph.facebook.com/oauth/access_token', {
    client_id,
    client_secret,
    grant_type: 'client_credentials',
  })
  .then(response => response.json())
  .then(({access_token}) => {
    return access_token
  })
}

const getLocationIds = (access_token, options) => {
  return httpGet('https://graph.facebook.com/v2.7/search', {
    type: 'place',
    center: `${options.lat},${options.lon}`,
    distance: options.dist || 10000,
    limit: options.limit || 100,
    fields: 'id',
    access_token
  })
  .then(response => response.json())
  .then(({data}) => {
    return data.map(({id}) => id);
  })
}

const getEventsByLocations = (access_token, locationIds, sinceDate) => {
  const since = ((sinceDate || new Date()).getTime()/1000).toFixed();

  return httpGet('https://graph.facebook.com/v2.7/', {
    ids: locationIds.join(','),
    fields: eventsFields(since).join(","),
    access_token
  })
  .then(response => response.json())
  .then((body) => {
    return body;
  })
}

const groupIds = (ids, groupSize = 50) => {
  if(ids.length > groupSize) {
    return ids.reduce((prev, next) => {
      if(prev[prev.length-1].length < groupSize) {
        prev[prev.length-1].push(next)
      } else {
        prev.push([next]);
      }
      return prev
    }, [[]]);
  } else {
    return [ids];
  }
}

const httpGet = (url, params) => {
  return fetch(url+'?'+formatParams(params))
}

const formatParams = (paramJson) => {
  return Object.keys(paramJson)
    .map(key => key + '=' + paramJson[key])
    .join('&');
}

const getGroupedEventByLocations = (accessToken, locations) => {
  locations = groupIds(locations);

  let response = {};
  let promise = Promise.resolve({})

  locations.forEach(locationGroup => {
    promise = promise.then(events => {
      response = Object.assign({}, response, events);
      return getEventsByLocations(accessToken, locationGroup)
    });
  })

  return promise.then(events => {
    return Object.assign({}, response, events);
  });
}

export default class FbEvents {
  constructor(client_id, client_secret) {
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  getAppToken() {
    return getToken(this.client_id, this.client_secret)
    .then(token => {
      this.setToken(token);
      return token;
    });
  }

  setToken(token) {
    this.token = token;
    return Promise.resolve(token);
  }

  getEvents(options) {
    return getLocationIds(this.token, options)
    .then(locations => {
      return getGroupedEventByLocations(this.token, locations);
    })
    .then(unfilteredEvents => {
      if(options.filter) {
        return Object.keys(unfilteredEvents)
          .map(key => unfilteredEvents[key])
          .filter(({events}) => events)
          .reduce((prev, next) => {
            next.events.data.forEach(event => {
              event.venue = Object.assign({}, next);
              delete event.venue.events;
              prev.push(event)
            })
            return prev;
          }, [])
      }
      return Object.keys(unfilteredEvents)
        .map(key => unfilteredEvents[key]);
    })
  }
}
