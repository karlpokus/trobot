var url = process.argv[4];
if (!url) {
  throw new Error('must pass url');
}

['key', 'token', 'secret', 'userId', 'username', 'webhookCallbackURLdefault'].forEach(function(key){
  process.env[key.toUpperCase()] = 'foo';
});

var test = require('tape'),
    crypto = require('crypto'),
    http = require('http'),
    server = http.createServer(),
    port = process.env.PORT || 8080,
    requestLib = require('request'),
    Trobot = require('../lib/trobot.js'),
    bot = new Trobot(),
    base64Digest = function(s) {
      return crypto.createHmac('sha1', process.env.SECRET).update(s).digest('base64');
    },
    logs = [];

server.on('request', function(req, res){
  bot.emit('request', req, res);
});

test.onFinish(server.close.bind(server));

test('request-with-logs', function(t){
  bot.on('log', function(str){
    logs.push(str);
  });

  bot.on('commentCard', function(data, res){
    t.equal(data.action.type, 'commentCard', 'event is commentCard');
    t.equal(logs.length, 3, '3 logs emitted');
    res.end();
    t.end();
  });

  var data = {
        action: {
          type: 'commentCard',
          memberCreator: {
            fullName: 'user'
          }
        },
        model: {
          name: 'name'
        }
      },
      body = JSON.stringify(data),
      callbackURL = process.env.WEBHOOKCALLBACKURLDEFAULT;

  server.listen(port, function(){
    requestLib({
      url: url,
      method: 'POST',
      headers: {
        "x-trello-webhook": base64Digest(body + callbackURL)
      },
      body: body
    });
  });
});
