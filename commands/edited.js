'use strict'

const global = require('../global.js')
const list = require('../db/edit.json')
const jsonfile = require('jsonfile')
const Discord = require('discord.js-self');


module.exports = {
    aliases: ['edit'],
    event: 'messageUpdate'
}

module.exports.func = async(oldMessage, newMessage, channel) => {
    if (list.users.includes(newMessage.author.id) ||
        list.users.includes(newMessage.channel.guild.id) ||
        list.users.includes(newMessage.channel.id)) {
        let embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`Message edited by ${newMessage.author.tag}`)
            .setAuthor(`${newMessage.author.tag}`, newMessage.author.avatarURL())
            .addField('Server:', newMessage.channel.guild.name)
            .addField('Channel:', '#' + newMessage.channel.name)
            .addField('Old message:', oldMessage.content)
            .addField('New message:', newMessage.content)
            .setTimestamp()
            .setThumbnail(newMessage.author.avatarURL())
            .setFooter(`${newMessage.author.id}`, newMessage.client.user.avatarURL())
        channel.send(embed)
    }
}

module.exports.command = async(message, commandArgs) => {
    let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])
    let json = list

    json['users'] = users
    jsonfile.writeFileSync('./db/edit.json', json, { spaces: 2 })
}