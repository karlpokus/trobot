[![Build Status](https://travis-ci.org/karlpokus/trobot.svg?branch=master)](https://travis-ci.org/karlpokus/trobot)

# TL;DR

Trobot is (1) a cli to manage webhooks from Trello and (2) a new and shiny bot to respond to said webhooks.

### What you need

- a trello user (to be the bot)
- a node.js server

### What you need to do

Get user data (username, userId, token, key, secret)

- username is in user profile
- userId by tacking `.json` unto any board url and start digging.
- token, secret and key at `https://trello.com/app-key`

Place user data in root as `trello-config.json` This is sensitive data so keep it safe.

```
{
  "key": "...", // request to Trello
  "token": "...", // request to Trello
  "secret": "...", // verify Trello as origin
  "userId": "...", // interactions
  "username": "...", // interactions
  "webhookCallbackURLdefault": "..." // handy helper
}
```

Install trobot `npm install trobot`

Add `"webhooks": "webhooks"` to `scripts` in your `package.json`

Add user to any model on Trello (boards, lists or cards etc.) you wish to monitor.

Manage webhooks via `npm run webhooks` called from root.

- Make sure you return a 200 for a quick HEAD to any callbackUrl you will provide before adding a new webhook. Trello checks this.
- There are multiple ways to build webhooks i.e one or more callbackURLs for one or more responses. You can also add query params to your callbackURL if it helps.
- Read more at `https://developers.trello.com/apis/webhooks`

After creating webhooks `require('trobot')` somewhere, add custom functions to your bot and apply them in routes.

All done!

# Examples

Trobot comes with three responses ready to use.

```
// Respond with a comment to someone forgetting to put @username in a comment
noRecipientInComment(data)

// Respond with a comment to someone calling the bots username in a comment
commentForBot(data)

// Respond with a comment to someone creating a card with a title of 100+ characters
longTitle(data)

// init
var Trobot = require('trobot'),
    config = require('./trello-config.json');

var bot = new Trobot(config);

/* add custom functions here */

// Somewhere in a route
var data = JSON.parse(req.body);

  if (bot.originIsTrello(req)) {

    if (bot.actionTypesAreOneOf(['commentCard'], data)) {
      bot.commentForBot(data);
      bot.noRecipientInComment(data);
    }

    if (bot.actionTypesAreOneOf(['createCard', 'updateCard'], data)) {
      bot.longTitle(data);
    }

  }

```

# License

MIT
