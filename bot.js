/*
  Developed by Astrydax, aka Royalcrown28 for vampwood
  For Custom Discord Bots please email me at Astrydax@gmail.com
*/
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs');
const jsonfile = require('jsonfile');
const chalk = require("chalk");
const bot = new Discord.Client();
const schedule = require('node-schedule');
var print = require("./modules/printValues.js").print;
var destiny = require("./modules/destiny.js").destiny;
var crit = require("./modules/crit.js").crit;
var shipcrit = require("./modules/crit.js").shipcrit;
var help = require("./modules/help.js").help;
var char = require("./modules/char.js").char;
var roll = require("./modules/roll.js").roll;
var polyhedral = require("./modules/dice.js").polyhedral;
var admin = require("./modules/admin.js").admin;
var init = require("./modules/init.js").init;
var reroll = require("./modules/reroll.js").reroll;
var version = require("./package.json").version;
var poly = require("./modules/poly.js").poly;
var gleepglop = require("./modules/misc.js").gleepglop;
var obligation = require("./modules/obligation.js").obligation;
var statUpdate = require("./modules/misc.js").statUpdate;



bot.login(config.token);
require('events').EventEmitter.defaultMaxListeners = 100;
//init destinyBalance
var destinyBalance = jsonfile.readFileSync('data/destinyBalance.json');

//Init the diceResult
var diceResult = jsonfile.readFileSync('data/diceResult.json');

//init characterStatus
var characterStatus = jsonfile.readFileSync('data/characterStatus.json');

//init initiativeOrder
var initiativeOrder = jsonfile.readFileSync('data/initiativeOrder.json');

//init stats
var botStats = jsonfile.readFileSync('data/botStats.json');


//Called When bot becomes functional
bot.on("ready", () => {
  console.log(`Bot version ${version}`);
  console.log(`Logged in as ${bot.user.username}!`);
  var dailyJob = schedule.scheduleJob({second: 1}, () => {
    botStats = statUpdate(botStats);
  });
});

//Called whenever a users send a message to the server
bot.on("message", message => {
  //Ignore messages sent by the bot
  if (message.author.bot) return;
  //Ignore messages that dont start with the command symbol
  if (!message.content.includes(config.prefix)) return;
  //Seperate and create a list of parameters. A space in the message denotes a new parameter

  if (!message.content.startsWith(config.prefix)) {
    var params = message.content.split(" ");
    for (var i=0; params.length>i; i++) {
      if (params[i].startsWith(config.prefix)) break;
    }
    params = params.slice(i);
  } else var params = message.content.split(" ");

  //create command
  if (params.length == 0) return;

  var command = params[0].toLowerCase().toString().slice(1);
  params = params.slice(1);

  if (command.startsWith('d') && (command.length > 1) && (command != 'destiny')) {
    var sides = command.replace(/\D/g, "");
    command = 'polyhedral';
  }
  //init the descriptor string to an empty string
  var desc = "";
  var beg, end = 0;
  var begF, endF = false;
  for (var i = 0; i < params.length; i++) {
    if (params[i].includes('"')) {
      if (!begF) {
        beg = i;
        end = i;
        begF = true;
      } else if (begF && !endF) {
        end = i;
        endF = true;
      }
    }
  }
  //remove the text field arguments from the list of parameters before checking for dice.
  for (i = beg; i <= end; i++) {
    desc += " " + params[i];
  }
  var spliceAmnt = end + 1 - beg;
  params.splice(beg, spliceAmnt);
  //remove Quotes from descriptor
  desc = desc.replace(/['"]+/g, '');

  //set the rest of params to lowercase
  if (params != undefined) {
    params = params.filter(Boolean);
    for (var i = 0; i < params.length; i++) {
    params[i] = params[i].toLowerCase();
  }

  console.log("@" + message.author.username + " " + message.createdAt);
  console.log(command + " " + params + " " + desc);


//************************COMMANDS START HERE************************

if (message.channel.type == "dm" || message.channel.type == "text") {

  switch (command) {
    //Ver command
    case "ver":
      message.channel.sendMessage(bot.user.username + ": version: " + version);
      break;
    //Character Tracker
    case "char":
      botStats.daily.char++;
      char(params, characterStatus, message);
      break;
    // help module
    case "help":
      botStats.daily.help++;
      help(params, message);
      break;
    case "gleepglop":
    case "species":
      botStats.daily.species++;
      gleepglop(message);
      break;
    }
  }

if (message.channel.type == "text") {

  switch (command) {
    case "polyhedral":
      botStats.daily.d++;
      polyhedral(sides, params, message);
      break;
    case "poly":
      botStats.daily.poly++;
      poly(params, message);
      break;
    //!crit command
    case "crit":
      botStats.daily.crit++;
      crit(params, message);
      break;
    //!shipcrit command
    case "shipcrit":
      botStats.daily.shipcrit++;
      shipcrit(params, message);
      break;
    //Destiny Point Module
    case "destiny":
    case "d":
      botStats.daily.destiny++;
      destiny(params, destinyBalance, message, config);
      break;
      // Roll the dice command
    case "roll":
    case "r":
      botStats.daily.roll++;
      roll(params, diceResult, message, config, desc);
      break;
    case "reroll":
    case "rr":
      botStats.daily.reroll++;
      reroll(params, diceResult, message, config, desc);
      break;
    case "init":
    case "i":
      botStats.daily.init++;
      init(params, initiativeOrder, message, diceResult, config, desc);
      break;
    case "obligation":
    case "o":
      botStats.daily.obligation++;
      obligation(params, characterStatus, message);
      break;
    }
  }
  if (message.author.id == config.adminID) {
    admin(command, message, bot, botStats);
  }
  jsonfile.writeFile("data/botStats.json", botStats);

}
process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: \n" + err.stack);
});
});
