var writeBotStats = require("./misc.js").writeBotStats;
var statUpdate = require("./misc.js").statUpdate;
const config = require("../config.js").config;


function admin(command, message, botStats, bot, params) {
  switch (command) {
    case "stats":
      message.channel.send(`Currently on ${bot.guilds.size} servers!\nCurrently assisting ${bot.guilds.reduce((a, b) => a + b.memberCount, 0)} users!`);
      break;
    case "logout":
      bot.logout();
      break;
    case "fix":
      break;
    case "test":
      break;
    case "botstats":
      let text = writeBotStats(botStats, params[0]);
      message.channel.send(text);
      break;
    default:
      break;
  }
}

module.exports = {
    admin: admin,
};
