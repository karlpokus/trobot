// modules
var test = require('tape'),
    crypto = require('crypto'),
    Trobot = require('../lib/trobot.js');

// setup
var data = {
      "key": "1",
      "token": "2",
      "secret": "3",
      "userId": "4",
      "username": "name",
      "webhookCallbackURLdefault": "none"
    },
    bot = new Trobot(data),
    thisWillThrow = function() {
      new Trobot();
    },
    base64Digest = function (s) {
      return crypto.createHmac('sha1', data.secret).update(s).digest('base64');
    };

// TESTs

test('new Trobot', function(t){
  
  t.throws(thisWillThrow, 'Throws error on no args');
  t.ok(bot.d, 'has prop d');
  t.ok(bot.t, 'has prop t');
  t.end();
  
});

test('helpers', function(t) {
  
  t.ok(bot.authorIsNotBot('randomUserId'), 'authorIsNotBot');
  t.ok(bot.botInComment('Hello ' + data.username), 'botInComment');
  t.ok(bot.commentHasNoProboscis('dummy data'), 'commentHasNoProboscis');
  
  var callbackURL = data.webhookCallbackURLdefault,
      body = 'doo',
      request = {
        "body": body,
        "headers": {
          "x-trello-webhook": base64Digest(body + callbackURL)
        }
      };
  
  t.ok(bot.originIsTrello(request), 'originIsTrello');
  
  var actionData = {
    action: {
      type: 'commentCard'
    }
  }
  
  t.ok(bot.actionTypesAreOneOf(['commentCard'], actionData), 'actionTypesAreOneOf');
  
  t.end();
  
});