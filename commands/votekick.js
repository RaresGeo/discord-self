"use strict";

const global = require("../global.js");
const Discord = require("discord.js-self");
const config = global.getConfig();
const checkEmoji = "✅";
const xEmoji = "❌";

module.exports = {
  aliases: ["votekick"],
  event: "message",
};

module.exports.command = async (message, commandArgs) => {
  if (commandArgs._.length !== 3 && commandArgs._.length !== 2) {
    let string = `Invalid arguments. ex: ${config.prefix}${module.exports.aliases[0]} <channel uid> <user uid> <duration in seconds>`;
    global.editDelete(message, string, config.messageLife * 1000);
    return;
  }

  // Channel to do it in
  let channel;
  let channelUid = commandArgs._[0];
  if (channelUid.length == 18) {
    channel = await global.getChannel(message, channelUid);
  } else {
    let string = `Invalid channel uid. ex: ${config.prefix}${module.exports.aliases[0]} <channel uid> <user uid> <duration in seconds>`;
    global.editDelete(message, string, config.messageLife * 1000);
    return;
  }

  // User to do it to
  let user;
  let userUid = commandArgs._[1];
  if (userUid.length == 18) {
    user = await global.getUser(message, userUid);
  } else {
    let string = `Invalid user uid. ex: ${config.prefix}${module.exports.aliases[0]} <channel uid> <user uid> <duration in seconds>`;
    global.editDelete(message, string, config.messageLife * 1000);
    return;
  }

  // Duration until count
  let delay = 24; // 24 hours
  if (commandArgs._[2]) {
    delay = parseInt(commandArgs._[2]);
  }
  delay *= 1000 * 60 * 60;

  // Construct embed
  let embed = new Discord.MessageEmbed()
    .setColor("DARK_BUT_NOT_BLACK")
    .setTitle(`Votekick for ${user.username}`)
    .addField("Duration", `${delay / (1000 * 60 * 60)} hours`)
    .setTimestamp()
    .setThumbnail(user.avatarURL());

  // Send message and add reactions
  let initialMessage = await channel.send(embed);
  initialMessage.react(checkEmoji);
  initialMessage.react(xEmoji);

  let yesVotes = 0;
  let noVotes = 0;

  // Start countdown
  setTimeout(() => {
    let reactions = initialMessage.reactions.cache;

    reactions.map((reaction) => {
      let { emoji } = reaction;
      let { count } = reaction;
      let emojiName = emoji.toString();
      let isNo = emojiName === xEmoji;
      let isYes = emojiName === checkEmoji;
      yesVotes += count * isYes;
      noVotes += count * isNo;
    });

    yesVotes--;
    noVotes--;

    let verdict = yesVotes > noVotes * 5;

    initialMessage.delete();
    let embed = new Discord.MessageEmbed()
      .setColor(verdict ? "RED" : "GREEN")
      .setTitle(`Votekick for ${user.username}`)
      .addField("VERDICT", verdict ? "Kicked" : "Vote failed")
      .setTimestamp()
      .setThumbnail(user.avatarURL());

    channel.send(embed);
  }, delay);
};
