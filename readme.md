# Facebook Places

Inspired by https://github.com/tobilg/facebook-events-by-location-core

### How to get it working

Install all the dependencies with `yarn install`
Create a file `server.js`
Run `yarn start`

This is not a NPM module, so if you want to use it in you project you can just copy the `fb-events-es6` folder (if you're using ES6) or the `fb-events-es5` folder if you're using ES5  inside your project and then import it however you want (require/import)...


### Examples

#### With Facebook App Token

```javascript
import FbEvents from './fb-events-es6'

const FACEBOOK_CLIENT_ID = 'XXXX';
const FACEBOOK_CLIENT_SECRET = 'YYYYY';

const fbEvent = new FbEvents(FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET);

const eventOptions = {
  lat: 38.389482,
  lon: -0.4408048,
  filter: true,
  // dist: 500, // default 10000 (10km)
  // limit: 5, // default 100
}

fbEvent.getAppToken()
.then(() => {
  return fbEvent.getEvents(eventOptions);
})
.then(events => {
  console.log("count", events.length);
  console.log("first events", events[0]);
})
.catch(err => {
  console.log(err);
})
```

#### With User Token

```javascript
import FbEvents from './fb-events-es6'

const USER_TOKEN = 'ZZZZZZ';

const fbEvent = new FbEvents();

const eventOptions = {
  lat: 38.389482,
  lon: -0.4408048,
  filter: true,
  // dist: 500, // default 10000 (10km)
  // limit: 5, // default 100
}

fbEvent.setToken(USER_TOKEN)
.then(() => {
  return fbEvent.getEvents(eventOptions);
})
.then(events => {
  console.log("count", events.length);
  console.log("first event", events[0]);
})
.catch(err => {
  console.log(err);
})
```
