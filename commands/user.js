'use strict'

const global = require('../global.js')
const config = global.getConfig()
const Discord = require('discord.js-self');

module.exports = {
    aliases: ['user', 'who', 'whois', 'userinfo'],
    event: 'message'
}

module.exports.command = async(message, commandArgs) => {

    if (commandArgs._.length < 2) {
        let id = (commandArgs._.length == 1) ? global.getUserId(commandArgs._[0]) : global.getUserId(message.author.id)

        if (id.length == 18) {
            global.getUser(message, id)
                .then(user => {
                    let embed = new Discord.MessageEmbed()
                        .setColor('RANDOM')
                        .setAuthor(`${user.tag}`, user.avatarURL())
                        .addField('Created at ', user.createdAt.toDateString())
                        .setTimestamp()
                        .setThumbnail(user.avatarURL())
                        .setFooter(`${user.id}`, message.client.user.avatarURL())
                    message.channel.send(embed)
                })
                .catch(console.error);

        } else {
            global.editDelete(message, 'Invalid syntax.\n**Invalid id**', config.messageLife * 1000)
        }
    } else {
        global.editDelete(message, 'Invalid syntax.\n**Too many arguments**', config.messageLife * 1000)
    }
}