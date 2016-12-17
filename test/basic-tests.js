['key', 'token', 'secret', 'userid', 'username', 'webhookcallbackurldefault'].forEach(function(key){
  process.env[key.toUpperCase()] = 'foo';
});

var test = require('tape'),
    crypto = require('crypto'),
    Trobot = require('../lib/trobot.js'),
    bot = new Trobot(),
    base64Digest = function(s) {
      return crypto.createHmac('sha1', process.env.SECRET).update(s).digest('base64');
    };

test('new Trobot', function(t){
  t.equal(typeof bot.data, 'object', 'bot.data is an object');
  t.equal(typeof bot.trello, 'object', 'bot.trello is an object');
  t.equal(typeof bot.emit, 'function', 'bot.emit is a function');
  t.equal(typeof bot.originIsTrello, 'function', 'bot.originIsTrello is a function');
  t.end();
});

test('originIsTrello', function(t){
  var callbackURL = process.env.WEBHOOKCALLBACKURLDEFAULT,
      body = 'body',
      request = {
        "body": body,
        "headers": {
          "x-trello-webhook": base64Digest(body + callbackURL)
        }
      };

  t.ok(bot.originIsTrello(request), 'origin is Trello');
  t.end();
});
