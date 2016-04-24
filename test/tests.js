// modules
var test = require('tape'),
    crypto = require('crypto'),
    Trobot = require('../lib/trobot.js');

// setup
process.env.KEY = 'foo';
process.env.TOKEN = 'foo';
process.env.SECRET = 'foo';
process.env.USERID = 'foo';
process.env.USERNAME = 'foo';
process.env.WEBHOOKCALLBACKURLDEFAULT = 'foo';

var data = {
      "key": "1",
      "token": "2",
      "secret": "3",
      "userId": "4",
      "username": "name",
      "webhookCallbackURLdefault": "none"
    },
    bot = new Trobot(data),
    botNoArgs = new Trobot(),
    base64Digest = function (s) {
      return crypto.createHmac('sha1', data.secret).update(s).digest('base64');
    };

// TESTs

test('new Trobot', function(t){

  t.ok(bot.d, 'with args has prop d');
  t.ok(bot.t, 'with args has prop t');
  t.ok(botNoArgs.d, 'no args has prop d');
  t.ok(botNoArgs.t, 'no args has prop t');
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
