// modules
var Trello = require("node-trello"),
    crypto = require('crypto');

// export
var Trobot = module.exports = function(data) {

  if (!data) {
    throw new Error('data is required');
  }

  this.d = data;
  this.t = new Trello(data.key, data.token);
}

// HELPERs

Trobot.prototype.authorIsNotBot = function (authorId) {
	return authorId !== this.d.userId;
};

Trobot.prototype.botInComment = function(comment) {
	var username = this.d.username,
  		flag = new RegExp(username, 'g').test(comment);
  return flag;
};

Trobot.prototype.commentHasNoProboscis = function(comment) {
  return !/@/g.test(comment);
}

Trobot.prototype.postComment = function(cardId, answer) {
  var url = "/1/cards/" + cardId + "/actions/comments",
  		payload = {text: answer};
  
  // POST
  this.t.post(url, payload, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('postComment done');
    }
  });
};

Trobot.prototype.actionTypesAreOneOf = function(arr, data) {
  return arr.indexOf(data.action.type) !== -1;
};

Trobot.prototype.originIsTrello = function(request, secret, callbackURL) {
  var base64Digest = function (s) {
        return crypto.createHmac('sha1', secret).update(s).digest('base64');
      },
      secret = secret || this.d.secret,
      callbackURL = callbackURL || this.d.webhookCallbackURLdefault;
      
  var content = request.body + callbackURL;
  var doubleHash = base64Digest(base64Digest(content));
  var headerHash = base64Digest(request.headers['x-trello-webhook']);
  return doubleHash == headerHash;
}

// POSTs

Trobot.prototype.noRecipientInComment = function(data) {
  var comment = data.action.data.text,
      authorId = data.action.memberCreator.id,
      authorUsername = data.action.memberCreator.username,
      cardId = data.action.data.card.id,
  		answer;
  // check
  if (this.commentHasNoProboscis(comment) && this.authorIsNotBot(authorId)) {
    answer = "@" + authorUsername + " @username will notify the user of your comment by e-mail.";
    // POST
    this.postComment(cardId, answer);
  }
};

Trobot.prototype.commentForBot = function(data) {
  var comment = data.action.data.text,
      authorId = data.action.memberCreator.id,
      authorUsername = data.action.memberCreator.username,
      cardID = data.action.data.card.id,
      answer;
  // check
  if (this.botInComment(comment) && this.authorIsNotBot(authorId)) {
    answer = "@" + authorUsername + " Blip blop. Syntax error :)";
    // POST
    this.postComment(cardID, answer);
  }
};

Trobot.prototype.longTitle = function(data) {
  var title = data.action.data.card.name.length,
      authorUsername = data.action.memberCreator.username,
      cardID = data.action.data.card.id,
      answer;
  // check
  if (title > 100) {
    answer = "@" + authorUsername + " Long titles are hard to read :( Maybe put some of that important data in description?";
    // POST
    this.postComment(cardID, answer);
  }
};