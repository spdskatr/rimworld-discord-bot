const Discord = require('discord.js');
const auth = require('./auth.json');
const db = require('sqlite');
const Manager = require('./src/Manager');
const Commands = require('./src/Commands');


const manager = new Manager(db);

// Initialize Discord Bot
const client = new Discord.Client();

client.on('ready', (evt) => {
  console.info('Connected');
  console.info('Logged in as: ');
  console.info(client.user.username + ' - (' + client.user.id + ')');
});

client.on("message", (message) => {
  if (message.author.bot) {
    return;
  } // Ignore bots.
  // if (message.channel.name !== "my-secret-dev-channel") {
  //   return;
  // } // Only certain channel

  if (message.content.substring(0, 1) !== '!') {
    return;
  } // Only messages that start with '!'

  let args = message.content.substring(1).split(' ');
  const cmd = args[0];

  args = args.splice(1);

  switch (cmd) {
    case 'ping': {
      message.channel.send('Pong!');
      break;
    }
    case 'stats': {
      Commands.showStats(manager, message, args);
      break;
    }
    case 'join': {
      Commands.addColonist(manager, message, args);
      break;
    }
    case 'colonists': {
      Commands.showColonists(manager, message, args);
      break;
    }
    case 'colonist': {
      Commands.showColonist(manager, message, args);
      break;
    }
    case 'inventory': {
      Commands.showInventory(manager, message, args);
      break;
    }
    case 'settle': {
      Commands.addSettlement(manager, message, args);
      break;
    }
    case 'settlements': {
      Commands.showSettlements(manager, message, args);
      break;
    }
  }
});

Promise.resolve()
  .then(() => db.open('./rimworld.sqlite', {Promise}))
  .catch(err => console.error(err.stack))
  .then(() => init())
  .then(() => load());

function init() {
  return Promise.resolve()
    .then(() => db.run("CREATE TABLE IF NOT EXISTS colonists (userId TEXT, username TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
    .then(() => db.run("CREATE TABLE IF NOT EXISTS settlements (name TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
}

/**
 * @typedef {Object} ColonistSerialized
 *
 * @property {string} userId
 * @property {string} username
 * @property {string} data
 */

/**
 * @typedef {Object} SettlementSerialized
 *
 * @property {string} name
 * @property {string} data
 */

function load() {
  return Promise.all([
    db.all('SELECT * FROM colonists')
      .then(colonists => {
        if (colonists) {
          manager.setColonists(colonists)
        }
      })
      .catch(console.error),

    db.all('SELECT * FROM settlements')
      .then(settlements => {
        if (settlements) {
          manager.setSettlements(settlements)
        }
      })
      .catch(console.error),

    client.login(auth.token)
  ]);
}