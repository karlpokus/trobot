#!/usr/bin/env node

var rl = require('readline-sync'),
    chalk = require('chalk'),
    Trello = require("node-trello");

var logger = {
  log: function(state, str) {
    if (state === 'ok') {
      str = chalk.green(str);
    }
    if (state === 'not ok') {
      str = chalk.red(str);
    }
    if (state === 'header') {
      str = chalk.inverse(str);
    }
    console.log('\n' + str + '\n');
  },
  action: function() {
    this.log('header', 'Action');

    var actions = ['list', 'add', 'toggle', 'remove'],
        index = rl.keyInSelect(actions, ">"); // 0 returns -1

    if (index >= 0) {
      webhooks[actions[index]]();

    } else {
      this.log('ok', 'Exit ok');
      return
    }
  }
};

var webhooks = {
  list: function() {
    logger.log('header', 'List');
    var url = '/1/tokens/' + this.t.token + '/webhooks';

    this.t.get(url, function(err, data) {
      if (err) {
        logger.log('not ok', err);
        return
      }

      if (data && data.length === 0) {
        logger.log('ok', 'No webhooks found');
        return

      } else {
        logger.log('ok', data.length + " webhook(s) found\n");

        data.forEach(function(hook){
          console.log(hook);
        });
      }
    });
  },
  add: function() {
    logger.log('header', 'Add');

    var that = this,
        id = rl.question('Model id: '),
        url = rl.question('CallbackUrl: [d for default] '),
        desc = rl.question('Description: ');

    if (!id || !url || !desc) {
      logger.log('not ok', 'Missing input');
      return;
    }

    if (url === 'd') {
      url = this.d.webhookcallbackurldefault;
    }

    var hookURL = "/1/webhooks",
        hookData = {
          description: desc,
          callbackURL: url,
          idModel: id,
          key: this.t.key,
          token: this.t.token
        };

    this.t.post(hookURL, hookData, function(err, data){
      if (err) {
        logger.log('not ok', err);
        return
      }

      logger.log('ok', data.description + ' added');
      that.list();
    });
  },
  toggle: function() {
    logger.log('header', 'Toggle');

    var that = this,
        id = rl.question('Webhook id: ');

    var hookURL = "/1/webhooks/" + id + "/active",
        hookData = {
          key: this.t.key,
          token: this.t.token
        };

    this.t.get(hookURL, hookData, function(err, data){
      if (err) {
        logger.log('not ok', err);
        return
      }

      hookData.value = !data._value;

        that.t.put(hookURL, hookData, function(err, data){
          if (err) {
            logger.log('not ok', err);
            return
          }

          logger.log('ok', data.description + ' toggled');
          that.list();
        });
    });
  },
  remove: function() {
    logger.log('header', 'Remove');

    var that = this,
        id = rl.question('Webhook id: ');

    var delHookURL = "/1/webhooks/" + id,
        hookData = {
          key: this.t.key,
          token: this.t.token
        };

    this.t.del(delHookURL, hookData, function(err, data){
      if (err) {
        logger.log('not ok', err);
        return
      }

      logger.log('ok', 'Webhook deleted');
      that.list();
    });
  },
  init: function() {
    var data = {};

    ['key', 'token', 'secret', 'userid', 'username', 'webhookcallbackurldefault']
      .forEach(function(key){
        data[key] = process.env[key.toUpperCase()];
      });

    this.t = new Trello(data.key, data.token);
    this.d = data;
    logger.action();
  }
}

webhooks.init();
