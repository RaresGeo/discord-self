'use strict'

require('dotenv').config()

const global = require('./global.js')
const config = global.getConfig()

const Discord = require('discord.js-self')
const client = new Discord.Client()

client.commands = {
    message: {}
}

client.modules = {
    message: {}
}

function registerCommand(module) {
    if (module.func && typeof module.func === 'function') {
        client.modules[module.event][module.aliases[0]] = module.func
    }
    if (module.command && typeof module.command === 'function') {
        module.aliases.forEach(alias => {
            client.commands[module.event][alias] = module.command
        })
    } else {
        module.aliases.forEach(alias => {
            client.commands[module.event][alias] = module
        })
    }
}

function removeCommand(module) {
    if (module.func && typeof module.func === 'function') {
        client.modules[module.event][module.aliases[0]] = message => {
            return;
        }
    }
}



client.on('ready', () => {
    let _cmds = require('fs').readdirSync('./commands')
    for (let i = 0; i < _cmds.length; i++) {
        let cmd = require(`./commands/${_cmds[i]}`)
        registerCommand(cmd)
    }

    console.log('Logged in as ' + client.user.tag + ' successfully.')
})

// Handle all commands
client.on("message", async message => {
    // Pass on message to all passive commands
    Object.keys(client.modules['message']).forEach(key => {
        client.modules['message'][key](message)
    })

    // Handle actual commands
    if (message.author.id === config.uid || global.getTrusted().users.includes(message.author.id)) { // Check if bot or trusted
        if (message.content.startsWith(config.prefix)) { // Starts with prefix
            //var trusted = global.getTrusted()
            let split = message.content.toLowerCase().split(/\s+/)
            let command
                // Get actual command
                // My phone's autocorrect puts a space after the prefix so I have this here just to handle a command looking like this: "% command"
                // You know, just having a space in between the prefix and the actual command, or more of them, hence \s+
                // This means that I also have to handle this scenario when parsing the arguments, so it makes the code a bit more janky
                // I'll do it anyway just for quality of life
            if (split[0] === config.prefix) {
                command = split[1]
            } else {
                command = split[0].substr(1)
            }

            if (!client.commands['message'][command]) {
                global.editDelete(message, 'Invalid command.', config.messageLife * 1000)
                return;
            }

            if (typeof client.commands['message'][command] === 'function') {

                let args = split.slice((split[0] === config.prefix) ? 2 : 1) // In case there is a space after the prefix, remove the command itself from arguments
                let commandArgs = global.parseArgs(args)

                client.commands['message'][command](message, commandArgs)
            } else {
                let action = split[(split[0] === config.prefix) ? 2 : 1]
                switch (action) {
                    case 'on':
                        registerCommand(client.commands['message'][command])
                        global.editDelete(message, `Turned on ${command}.`, config.messageLife * 500)
                        break
                    case 'off':
                        removeCommand(client.commands['message'][command])
                        global.editDelete(message, `Turned off ${command}.`, config.messageLife * 500)
                        break
                    default:
                        global.editDelete(message, 'Invalid syntax.', config.messageLife * 500)

                }
            }
        }
    }
})

client.login(config.token)