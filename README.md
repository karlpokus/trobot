[![npm version](https://badge.fury.io/js/trobot.svg)](https://badge.fury.io/js/trobot)
[![Build Status](https://travis-ci.org/karlpokus/trobot.svg?branch=master)](https://travis-ci.org/karlpokus/trobot)

# 3.x
Since 2.x trobot has a new api consisting of a pub/sub system which is much simpler to use and maintain. Just add webhooks and subscribe to trello model events. Note: Major versions includes breaking changes.

# trobot
Trobot is (1) a cli to manage webhooks from Trello and (2) a new and shiny bot to respond to said webhooks.

### What you need
- a trello user (to be the bot)
- a node.js server. Note: Trello webhooks require node 6.x

### What you need to do
Get user data (username, userId, token, key, secret) from Trello.

- `username` is in user profile
- `userid` by tacking `.json` unto any board url and start digging.
- `token`, `secret` and `key` at `https://trello.com/app-key`

Add user data to `process.env[key]` in ALL CAPS for the bot and webhooks to work. These will also be available in lowercase under `bot.data` (see below). Remember - this is sensitive data - so keep it safe.

```
{
  "key": "...", // request to Trello
  "token": "...", // request to Trello
  "secret": "...", // verify Trello as origin
  "userid": "...", // interactions
  "username": "...", // interactions
  "webhookcallbackurldefault": "..." // handy helper
}
```

# install
```
$ npm install trobot
```

# webhooks
- Add `webhooks: webhooks` to `scripts` in your `package.json`
- Add user to any model on Trello (boards, lists, and cards etc.) you wish to monitor.
- Manage webhooks via `npm run webhooks` called from root.
- Make sure you return a 200 for a quick HEAD to any callbackUrl you will provide before adding a new webhook. Trello checks this.
- There are multiple ways to build webhooks i.e 1+ callbackURLs for 1+ responses to 1+ model actions. You may also add query params to your callbackURL if it helps. Read more at `https://developers.trello.com/apis/webhooks`.

After creating webhooks - do `require('trobot')` somewhere, add custom event handlers and apply them in routes.

All done!

# usage
```javascript
/*
EVENT HANDLER
event: trello model event
data: trello event payload. Includes action and model
res: nodes http.ServerResponse to end the response when done
[this] is bot inside the callback
*/
bot.on(event, cb(data, res))

/*
TRIGGER EVENT
data and res are passed to the event handlers callback when the 'request' event is called.
Include as many args as you like for custom events.
*/
bot.emit(event [, args]);

// Events that have built-in event handlers that the user needs to trigger.
// parses payload, checks origin is trello, emits the model event and passes the payload and res to the event handler
bot.emit('request', req, res);
// posts a comment to a card
// event handler will end response
bot.emit('reply', cardId, answer, res);

// built-in events
// add an event handler to listen to the logs. Great for debugging.
bot.emit('log', msg);
// logs to the console by default and ends the response.
bot.on('error', err, statusCode, res);
```

# example
```javascript
// bot.js
var Bot = require('trobot'),
    bot = new Bot();

bot.on('commentCard', function(data, res){
  var comment = data.action.data.text,
      authorId = data.action.memberCreator.id,
      authorUsername = data.action.memberCreator.username,
      cardId = data.action.data.card.id,
  		answer;

  if (!/@/g.test(comment) && authorId !== this.data.userid) {
    answer = "@" + authorUsername + " include @username to notify the user of your comment by e-mail.";
    this.emit('reply', cardId, answer, res);
  }
});

module.exports = bot;
```

```javascript
// server.js
var http = require('http'),
    server = http.createServer(),
    port = process.env.PORT || 8080,
    bot = require('./bot.js');

server
  .on('request', function(req, res){
    if (req.method === 'HEAD') {
      res.statusCode = 200;
      res.end();
    } else if (req.method === 'POST') {
      bot.emit('request', req, res);
    } else {
      res.statusCode = 403;
      res.end();
    }
  })
  .listen(port);
```

Checkout [Max](https://github.com/karlpokus/max) for a complete example with a node server.

# test
```bash
# run basic tests
$ npm test
# run basics tests and server requests
$ npm run test:server -- [remote url | http://localhost:8080]
```

# TODOs
- [x] 2.0 api
- [ ] option `addDefaultWebhookOnAddMemberToBoard`
- [ ] option `avoidBotRespondingToBot` to omit events where `data.action.memberCreator.id` is bot
- [ ] option to disable `originIsTrello`
- [ ] option to disable error handler
- [x] update simple error handler
- [x] let error handler end response
- [x] add a 200 to HEAD in example
- [ ] maybe add some details on the trello model data obj
- [x] remove option to pass user data to constructor in trobot and webhooks and in the readme
- [x] emit `log` for debugging and let user add listeners as necessary
- [x] Add log to tests and readme
- [x] add note on trello webhooks require node 6.x
- [ ] remove surplus api keys in webhooks
- [x] 3.0 user data is lowercase on `bot.data`
- [x] log `response end` on `res.end`

# License
MIT
