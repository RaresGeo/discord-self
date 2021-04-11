'use strict'

let jsonfile = require('jsonfile')
const gambleConfig = require('../db/gamble.json')
const balance = './db/balance.json'

module.exports = {
    aliases: ['balance'],
    event: 'message'
}

// This is useless, I thought I'd use it for a gambling bot but I'll likely not finish that project
// I'll keep it just in case, but it's quite annoying and it requires the json files

module.exports.func = async message => {


    if (message.channel.id === gambleConfig.channel) {

        if (message.author.id === gambleConfig.botId && typeof message.embeds[0] === 'object') {

            let embedJSON = message.embeds[0].toJSON()

            let user = embedJSON.author.name
            let description = embedJSON.description

            if (description.includes('Leaderboard Rank')) {
                let json = jsonfile.readFileSync(balance, { throws: false })
                if (json === null) json = {}

                let newBalance = {}

                for (let i = 0; i < 3; i++) {
                    let val = embedJSON.fields[i].value
                    val = val.replace(",", "")
                    let valSplit = val.split(/\s+/)[1]

                    newBalance[`${embedJSON.fields[i].name}`] = valSplit

                }
                json[`${user}`] = newBalance
                jsonfile.writeFileSync(balance, json, { spaces: 2 })
            }
        }
    }
}