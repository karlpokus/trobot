var url = process.argv[4];
if (!url) {
  throw new Error('must pass url');
}

['key', 'token', 'secret', 'userid', 'username', 'webhookCallbackURLdefault'].forEach(function(key){
  process.env[key.toUpperCase()] = 'foo';
});

var test = require('tape'),
    crypto = require('crypto'),
    http = require('http'),
    server = http.createServer(),
    port = process.env.PORT || 8080,
    r = require('request'),
    Trobot = require('../lib/trobot.js'),
    bot = new Trobot(),
    base64Digest = function(s) {
      return crypto.createHmac('sha1', process.env.SECRET).update(s).digest('base64');
    };

test.onFinish(server.close.bind(server));

test('event:request', function(t){
  bot.on('commentCard', function(data, res){
    t.equal(data.action.type, 'commentCard', 'event is commentCard');
    res.end();
    t.end();
  });
  
  var data = {
        action: {
          type: 'commentCard'
        }
      },
      body = JSON.stringify(data),
      callbackURL = process.env.WEBHOOKCALLBACKURLDEFAULT;
  
  server
    .on('request', function(req, res){
      bot.emit('request', req, res);
    })
    .listen(port, function(){
      
      r({
        url: url,
        method: 'POST',
        headers: {
          "x-trello-webhook": base64Digest(body + callbackURL)
        },
        body: body
      }, function(){
        console.log('request done');
      });
      
    });
  
});