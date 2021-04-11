'use strict'

const global = require('../global.js')
const config = global.getConfig()
const commandMessage = 'I am open source at https://github.com/RaresGeo/discord-self'

module.exports = {
    aliases: ['bot', 'repo', 'github', 'source', 'sauce'],
    event: 'message'
}

module.exports.command = async(message, commandArgs) => {
    if (commandArgs.persistent || commandArgs.per || commandArgs.p) {
        global.edit(message, commandMessage)
    } else {
        global.editDelete(message, commandMessage, config.messageLife * 1000)
    }
}