'use strict'

const global = require('../global.js')
const config = global.getConfig()
const gambleConfig = require('../db/gamble.json')

module.exports = {
    aliases: ['copygamba'],
    event: 'message'
}

// This is useless, I thought I'd use it for a gambling bot but I'll likely not finish that project
// I'll keep it just in case, but it's quite annoying and it requires the json files

// At least this one sort of does something, I guess.

module.exports.func = async message => {

    if (message.content.startsWith(gambleConfig.cazinoPrefix) && // Check for if someone is using a gambling command
        message.channel.id === gambleConfig.channel && // Check for if the message was sent in the gambling channel
        message.author.id != config.uid) { // Ignore my own message

        // Ignore commands in gamble.json
        for (let i = 0; i < gambleConfig.ignoredCommands.length; i++) {
            if (message.content.includes(gambleConfig.ignoredCommands[i])) {
                console.log("Hit ignored command: " + message.content);
                return;
            }
        }


        // Check to see if we're getting robbed
        if (message.content.includes('rob')) {
            let split = message.content.split(/\s+/)
            let robbedId = split[1] // Gets argument of rob command

            // Check to see if it's equal to our uid, username, or tag
            if (robbedId.includes(config.uid) ||
                robbedId.toLowerCase().includes(client.user.username.toLowerCase())) {

                let robber = message.author.id;
                message.channel.send(";rob " + robber); // If it is, rob them back

            }
        } else {
            // Otherwise just copy the message as is
            message.channel.send(message); // Not sure if there's a difference between doing this and message.content
        }
    }
}