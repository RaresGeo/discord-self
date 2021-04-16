'use strict'

const global = require('../global.js')
const list = require('../db/delete.json')
const jsonfile = require('jsonfile')
const Discord = require('discord.js-self');


module.exports = {
    aliases: ['delete'],
    event: 'messageDelete'
}

module.exports.func = async(message, channel) => {
    if (list.users.includes(message.author.id) ||
        list.users.includes(message.channel.guild.id) ||
        list.users.includes(message.channel.id)) {
        let embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`Message deleted by ${message.author.tag}`)
            .setAuthor(`${message.author.tag}`, message.author.avatarURL())
            .addField('Server:', message.channel.guild.name)
            .addField('Channel:', '#' + message.channel.name)
            .addField('Message:', message.content)
            .setTimestamp()
            .setThumbnail(message.author.avatarURL())
            .setFooter(`${message.author.id}`, message.client.user.avatarURL())
        channel.send(embed)
    }
}

module.exports.command = async(message, commandArgs) => {
    let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])
    let json = list

    json['users'] = users
    jsonfile.writeFileSync('./db/delete.json', json, { spaces: 2 })
}