'use strict'

const global = require('../global.js')
const config = global.getConfig()
const list = require('../db/middle.json')
let jsonfile = require('jsonfile')

module.exports = {
    aliases: ['flipoff', 'finger', 'fuck', 'middlefinger'],
    event: 'message'
}

module.exports.func = async message => {
    if (list.users.includes(message.author.id) &&
        message.author.id != config.uid) { // Check for if the author is in the db and it's not the bot

        // Send the message
        message.react(`🖕`)
            .then(reaction => {
                console.log(`Reacted to "${reaction.message}" by ${reaction.message.author.tag} in ${reaction.message.channel.name}`)
            })
            .catch(console.error)
    }
}

module.exports.command = async(message, commandArgs) => {
    let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])

    let json = list
    json['users'] = users
    jsonfile.writeFileSync('./db/middle.json', json, { spaces: 2 })
}