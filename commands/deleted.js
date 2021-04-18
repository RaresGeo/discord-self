'use strict'

const global = require('../global.js')
const list = require('../db/delete.json')
const jsonfile = require('jsonfile')
const Discord = require('discord.js-self');


module.exports = {
    aliases: ['delete'],
    event: 'messageDelete'
}

const checkDatabase = (message, list) => {
    if (list.includes(message.author.id) ||
        list.includes(message.channel.guild.id) ||
        list.includes(message.channel.id)) {
        return true
    }
    return false
}

module.exports.func = async message => {
    if (checkDatabase(message, list.users) && !checkDatabase(message, list.blacklisted)) {
        let embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`Message deleted by ${message.author.tag}`)
            .setAuthor(`${message.author.tag}`, message.author.avatarURL())
            .addField('Server:', message.channel.guild.name)
            .addField('Channel:', '#' + message.channel.name)
            .addField('Message:', message.content)
            .setTimestamp()
            .setThumbnail(message.author.avatarURL())
            .setFooter(`${message.author.id}`, message.channel.guild.iconURL())

        list.channels.forEach(id => {
            let channel = global.getChannel(message, id)
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

    jsonfile.writeFileSync('./db/delete.json', json, { spaces: 2 })
}