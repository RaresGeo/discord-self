'use strict'

const global = require('../global.js')
let jsonfile = require('jsonfile')
const list = require('../db/trust.json')

module.exports = {
    aliases: ['trust', 'op'],
    event: 'message'
}

module.exports.command = async(message, commandArgs) => {
    let users = global.manageList(message, commandArgs, list.users, module.exports.aliases[0])

    let json = list
    json['users'] = users
    jsonfile.writeFileSync('./db/trust.json', json, { spaces: 2 })
}