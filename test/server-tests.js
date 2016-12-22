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
    logs = [],
    payload = {
      action: {
        type: 'commentCard',
        memberCreator: {
          fullName: 'user'
        }
      },
      model: {
        name: 'name'
      }
    };

function post(url, data, cb) {
  function base64Digest(s) {
    return crypto.createHmac('sha1', process.env.SECRET).update(s).digest('base64');
  };

  var body = JSON.stringify(data),
      callbackURL = process.env.WEBHOOKCALLBACKURLDEFAULT;

  requestLib({
    url: url,
    method: 'POST',
    headers: {
      "x-trello-webhook": base64Digest(body + callbackURL)
    },
    body: body
  }, cb);
}

server
  .on('request', function(req, res){
    bot.emit('request', req, res);
  })
  .listen(port);

test.onFinish(server.close.bind(server));

bot.on('log', function(str){
  logs.push(str);
});

test('common request with logs', function(t){
  bot.on('commentCard', function(data, res){
    t.equal(data.action.type, 'commentCard', 'event is commentCard');
    res.end(function(){
      t.equal(logs.length, 4, '4 logs emitted'); // dataparser, origin, user triggered event on model, end response
      t.end();
    });
  });

  post(url, payload);
});

test('request with unregistered model event', function(t){
  logs = [];
  payload.action.type = 'not a trello model event';

  post(url, payload, function(){
    t.equal(logs.length, 5, '5 logs emitted'); // dataparser, origin, user triggered event on model, no handler for event found, end response
    t.end();
  });
});
