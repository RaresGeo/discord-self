'use strict'

const global = require('../global.js')
const config = global.getConfig()
const list = require('../db/parrot.json')
let jsonfile = require('jsonfile')


module.exports = {
    aliases: ['parrot', 'copy'],
    event: 'message'
}

module.exports.func = async message => {

    if (list.users.includes(message.author.id) &&
        message.author.id != config.uid) { // Check for if the author is in the db and it's not the bot

        let parrotLine = message.content
        if (!parrotLine.length || parrotLine.startsWith(config.prefix)) return;

        // Send the modified (or not) message
        // Edit it in to avoid pinging people
        message.channel.send(message, parrotLine)
            .then(msg => {
                console.log(`Sent "${parrotLine}" by ${message.author.tag} in ${msg.channel.name}`)
            })
            .catch(console.error)
    }
}

module.exports.command = async(message, commandArgs) => {
    let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])

    let json = list
    json['users'] = users
    jsonfile.writeFileSync('./db/parrot.json', json, { spaces: 2 })
}