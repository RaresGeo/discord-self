'use strict'

const global = require('../global.js')
const config = global.getConfig()
const list = require('../db/rob.json')
const robPrefix = ';'
const Discord = require('discord.js-self')
const jsonfile = require('jsonfile')


module.exports = {
    aliases: ['rob', 'mug'],
    event: 'message'
}

module.exports.func = async message => {
    const author = message.author

    if (list.users.includes(message.author.id) &&
        author.id != config.uid &&
        list.channels.includes(message.channel.id)) { // Check for if the author is in the db and it's not the bot

        if (!message.content.startsWith(robPrefix)) return; // If it's not a command do nothing

        const isFromBot = message => message.author.id === '292953664492929025'

        // Wait for bot's message,
        const messageCollector = message.channel.createMessageCollector(isFromBot, { time: 2000 })

        messageCollector.on('collect', message => {
            let embedJSON
            try {
                embedJSON = message.embeds[0].toJSON()
            } catch {
                return
            }

            let user = embedJSON.author.name
            let value = embedJSON.description.replace(",", "").split(' ')[3]

            if (user === author.tag) {
                if (value >= list.threshold) {
                    // Rob his ass
                    let string = `${robPrefix}rob ${author.id}`
                    message.channel.send(string)

                    // Deposit all
                    // Do it three times just to be sure
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            let string = `${robPrefix}dep all`
                            message.channel.send(string)
                        }, 500)
                    }
                }
                messageCollector.stop()
            }
        })
    }
}

module.exports.command = async(message, commandArgs) => {
    let json = list

    if (commandArgs.c || commandArgs.channel) {
        let channels = global.manageList(message, commandArgs, list.channels, module.exports.aliases[0], 'channels')
        json['channels'] = channels
    } else {
        let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])
        json['users'] = users
    }

    jsonfile.writeFileSync('./db/rob.json', json, { spaces: 2 })
}