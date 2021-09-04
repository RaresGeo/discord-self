'use strict'

const global = require('../global.js')
const config = global.getConfig()
const puppeteer = require('puppeteer');


module.exports = {
    aliases: ['cfr', 'train', 'trains'],
    event: 'message'
}

const fixAndCapitalize = station => {
    let fix = station.split('-')
    for (let i = 0; i < fix.length; i++) {
        fix[i] = fix[i].charAt(0).toUpperCase() + fix[i].slice(1)
    }

    fix = fix.join(' ')

    return fix
}

module.exports.command = async(message, commandArgs) => {
    if (commandArgs._.length >= 2) {
        let date

        if (commandArgs._.length == 3) {
            date = commandArgs._[2]
        } else {
            let today = new Date()
            date = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear()
        }
        let url = `https://bilete.cfrcalatori.ro/ro-RO/Itineraries?DepartureStationName=${commandArgs._[0].replace('-', '%20')}&ArrivalStationName=${commandArgs._[1].replace('-', '%20')}&MinutesInDay=0&DepartureDate=${date}`

        global.edit(message, `Searching, please wait...\n<${url}>`)

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
        const page = await browser.newPage()
        await page.goto(url, {
            waitUntil: 'networkidle0',
        })

        const list = await page.$$eval('div.div-itinerary-station', divs => { return divs.map(div => div.innerText) })

        let fullString = `${fixAndCapitalize(commandArgs._[0])}, ${fixAndCapitalize(commandArgs._[1])}: \n\`\`\`cpp\n`

        if (!list.length) {
            global.editDelete(message, 'Invalid syntax.\n**Invalid stations**', config.messageLife * 1000)
        } else {
            list.forEach(item => {
                let split = item.split(/\s+/)

                split.splice(split.indexOf('min') + 1, split.indexOf('Sosire') - split.indexOf('min') - 1)

                if (commandArgs.raw) {
                    // Raw string

                    // Debugging purposes 
                    /*for (let i = 0; i < split.length; i++) {
                        console.log(`[${i}] ${split[i]}`)
                    } */

                    split = split.join(' ')
                    fullString += split + '\n'
                } else {
                    // Pretty string
                    let prettyString

                    let depLength = commandArgs._[0].split('-').length
                    let arrivLength = commandArgs._[1].split('-').length
                    let trainName = split.slice(3 + depLength, split.indexOf('Sosire'))
                    trainName = trainName.join(' ')

                    // I know this is a lot of janky and hacky string manipulation, but there really is no other way to make this pretty. It will have to do.
                    prettyString = split[2] + ' - ' + split[split.length - arrivLength - 1] + ' ----- ' + trainName

                    fullString += prettyString + '\n'
                }
            })
            fullString += '\`\`\`'

            global.edit(message, fullString, config.messageLife * 1000)
        }
        await browser.close()
    } else {
        global.editDelete(message, 'Insufficient arguments. [TODO] PUT PROPER HELP SYNTAX THINGIE HERE', config.messageLife * 1000)
    }


}