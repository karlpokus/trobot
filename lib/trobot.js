var Trello = require("node-trello"),
    crypto = require('crypto'),
    util = require('util'),
    ee = require('events');

function dataparser(req, cb) {
  var str = '';
  
  req
    .on('error', cb)
    .on('data', function(chunk) {
      str += chunk;
    }).on('end', function() {
      req.body = str;
      cb(null, str);
    });
}

var Trobot = module.exports = function(data) {
  var self = this;
  
  if (!data) {
    self.data = {
      "key": process.env.KEY,
      "token": process.env.TOKEN,
      "secret": process.env.SECRET,
      "userId": process.env.USERID,
      "username": process.env.USERNAME,
      "webhookCallbackURLdefault": process.env.WEBHOOKCALLBACKURLDEFAULT
    };
  }
  self.trello = new Trello(this.data.key, this.data.token);
  
  ee.call(self);

  self.on('error', function(err){
    console.log(err);
  });

  self.on('request', function(req, res){
    dataparser(req, function(err, str){
      if (err) {
        self.emit('error', err);
        return
      }
      
      var flag = self.originIsTrello(req);
      if (!flag) {
        self.emit('error', 'origin is not trello');
        return
      }
      
      var data = JSON.parse(str);
      self.emit(data.action.type, data, res);
    });
  });
  
  self.on('reply', function(cardId, answer, res){
    var url = "/1/cards/" + cardId + "/actions/comments",
    		payload = {text: answer};
    
    self.trello.post(url, payload, function(err, data) {
      if (err) {
        self.emit('error', err);
        return
      }
    });
    res.end();
  });
}

util.inherits(Trobot, ee);

Trobot.prototype.originIsTrello = function(request, secret, callbackURL) {
  var base64Digest = function (s) {
        return crypto.createHmac('sha1', secret).update(s).digest('base64');
      };
  secret = secret || this.data.secret;
  callbackURL = callbackURL || this.data.webhookCallbackURLdefault;

  var content = request.body + callbackURL;
  var doubleHash = base64Digest(base64Digest(content));
  var headerHash = base64Digest(request.headers['x-trello-webhook']);
  return doubleHash == headerHash;
}
