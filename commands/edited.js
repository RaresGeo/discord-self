'use strict'

const global = require('../global.js')
const list = require('../db/edit.json')
const jsonfile = require('jsonfile')
const Discord = require('discord.js-self');


module.exports = {
    aliases: ['edit'],
    event: 'messageUpdate'
}

const checkDatabase = (message, list) => {
    if (list.includes(message.author.id) ||
        list.includes(message.channel.guild.id) ||
        list.includes(message.channel.id)) {
        return true
    }
    return false
}

module.exports.func = async(oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) {
        return
    }

    if (checkDatabase(newMessage, list.users) && !checkDatabase(newMessage, list.blacklisted)) {
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
            .setFooter(`${newMessage.author.id}`, newMessage.channel.guild.iconURL())

        list.channels.forEach(id => {
            let channel = global.getChannel(newMessage, id)
            if (channel === undefined) {
                return
            }
            try {
                channel.send(embed)
            } catch (error) {
                console.log(error)
            }
        })
    }
}

module.exports.command = async(message, commandArgs) => {
    let json = list

    if (commandArgs.b || commandArgs.blacklist) {
        let blacklisted = global.manageList(message, commandArgs, list.blacklisted, module.exports.aliases[0], 'blacklisted')
        json['blacklisted'] = blacklisted
    } else if (commandArgs.c || commandArgs.channel) {
        let channels = global.manageList(message, commandArgs, list.channels, module.exports.aliases[0], 'channels')
        json['channels'] = channels
    } else {
        let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])
        json['users'] = users
    }

    jsonfile.writeFileSync('./db/edit.json', json, { spaces: 2 })
}