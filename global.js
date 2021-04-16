const Discord = require('discord.js-self');
const jsonfile = require('jsonfile')

require('dotenv').config()
const { MongoClient } = require('mongodb')

const uri = process.env.uri
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

var collection

client.connect()
    .then(client => {
        collection = client.db('discord').collection('commands')
        mongoPullAll()
    })

mongoAddUser = (query, newUser, field) => {
    collection.findOneAndUpdate(query, {
        $push: {
            [field]: newUser
        }
    })
}

mongoRemoveUser = (query, user, field) => {
    collection.findOneAndUpdate(query, {
        $pull: {
            [field]: user
        }
    })
}

mongoRemoveAll = (query, field) => {
    collection.findOneAndUpdate(query, {
        $set: {
            [field]: []
        }
    })
}

mongoPull = async(collection, query) => {
    const result = await collection.findOne(query)

    if (result) {
        return result
    } else {
        console.log(`Empty.`);
    }
}

// TODO: COPY DATABASE

const dbList = [
    'flipoff',
    'parrot',
    'trust',
    'delete',
    'edit'
]

mongoPullAll = async() => {
    for (let db of dbList) {
        let json = await mongoPull(collection, { name: db })
        jsonfile.writeFileSync(`./db/${db}.json`, json, { spaces: 2 })
    }
}

module.exports.mongoInsertOne = async(document, newValue) => {
    collection.findOneAndUpdate({ name: document }, { $set: { "users": newValue } })
}

module.exports.getConfig = () => {
    // This is just so I can deploy on heroku, use their config variables instead of a json file
    let config = {}
    config['prefix'] = process.env.prefix
    config['token'] = process.env.token
    config['uid'] = process.env.uid
    config['messageLife'] = process.env.messageLife
    return config
}

module.exports.getTrusted = () => {
    try {
        let json = jsonfile.readFileSync('./db/trust.json')
        return json
    } catch (error) {
        console.log(error)
        let json = {
            "users": []
        }
        json.users.push(process.env.uid)
        return json
    }
}

const config = module.exports.getConfig()

module.exports.sendDelete = async(message, string, time) => {
    message.channel.send(string)
        .then(msg => {
            msg.delete({ timeout: time })
        })
        .catch(console.error)
}

module.exports.editDelete = async(message, string, time) => {
    if (message.editable) {
        message.edit(string)
            .then(msg => {
                msg.delete({ timeout: time })
            })
            .catch(console.error)
    } else {
        message.channel.send(`_ _`)
            .then(msg => {
                msg.edit(string)
                    .then(msg => {
                        msg.delete({ timeout: time })
                    })
                    .catch(console.error)
            })
    }

}

module.exports.edit = async(message, string) => {
    if (message.editable) {
        return message.edit(string)
            .then(msg => {
                msg.edit(string)
                return msg.fetch()
            })
            .catch(console.error)
    } else {
        return message.channel.send(`...`)
            .then(msg => {
                msg.edit(string)
                return msg.fetch()
            })
            .catch(console.error)
    }

}

module.exports.test = async(message, string) => {
    return message.channel.send(`...`)
        .then(msg => {
            msg.edit(string)
            return msg.fetch()
        })
        .catch(console.error)
}

// TODO: ADD EDIT PROMISE WHICH SENDS A MESSAGE AND EDITS IT WHEN IT RECEIVES THE CONTENTS OF A PROMISE
// THIS WILL BE USED FOR TRAINS.JS

// TODO: ADD COMMAND TO HANDLE MENTION/UID/NAME/TAG AND ALWAYS RETURN UID
// Actually I think there is no way to do this, I'd have to instead simply handle all cases which frankly I do not want to do
// Correction: Just use message.client.users.find( and put here a function to filter by id/tag/username

module.exports.getUserId = user => {
    return user.toString().replace(/[^0-9]+/g, "")
}



// Minimist for some reason changed snowflakes because they aren't handled as strings, but numbers
// This works better for me regardless

module.exports.parseArgs = args => {
    let parsedArgs = {
        _: []
    }

    args.forEach(arg => {
        if (arg.startsWith('-')) {
            parsedArgs[arg.substr(1)] = true
        } else {
            parsedArgs._.push(arg)
        }
    })

    return parsedArgs
}

module.exports.getUser = async(message, id) => {
    return message.client.users.fetch(id)
}

module.exports.getServer = (message, id) => {
    let server = message.client.guilds.cache.get(id)
    return server
}

module.exports.getChannel = (message, id) => {
    let channel = message.client.channels.cache.get(id)
    return channel
}

getUserList = async(message, list) => {
    let users = []

    for (let i = 0; i < list.length; i++) {
        if (list[i].length === 18) {
            try {
                let user = await module.exports.getUser(message, list[i])
                users.push(user)
            } catch {
                let server = module.exports.getServer(message, list[i])
                let channel = module.exports.getChannel(message, list[i])

                if (server !== undefined) {
                    users.push(server)
                } else if (channel !== undefined) {
                    users.push(channel)
                }
            }
        }
    }
    return users
}

// TODO: COPY DATABASE

module.exports.manageList = (message, commandArgs, list, listName, field = 'users') => {

    if (commandArgs.r) {
        // Remove all ids in commandArgs._ if -r
        if (commandArgs._.includes('all')) { // Just remove everything if commandArgs._ contains 'all'
            let string = ''

            list.forEach(user => {
                string += `Removed <@${user}> from the ${listName} list\n`
            })

            module.exports.editDelete(message, string, config.messageLife * 1000)
            list = []
            mongoRemoveAll({ name: listName }, field)
        } else {
            commandArgs._.forEach(user => {
                let string = ''
                user = module.exports.getUserId(user)
                if (user.length == 18) { // Snowflakes are 18 characters long. If these are not, they're invalid
                    if (list.includes(user)) {
                        let index = list.indexOf(user)
                        list.splice(index, 1)
                        mongoRemoveUser({ name: listName }, user, field)
                        string += `Removed <@${user}> from the ${listName} list`
                    } else {
                        string += `<@${user}> is not in the list\n`
                    }
                } else {
                    string += `${user} is invalid user id\n`
                }
                module.exports.editDelete(message, string, config.messageLife * 1000)
            })
        }
    } else {
        if (commandArgs._.length) {
            // Add all _
            let string = ''
            commandArgs._.forEach(user => {
                user = module.exports.getUserId(user)
                if (user.length == 18) { // Snowflakes are 18 characters long. If these are not, they're invalid
                    if (!list.includes(user)) {
                        list.push(user)
                        mongoAddUser({ name: listName }, user, field)
                        string += `Added <@${user}> to the ${listName} list\n`
                    } else {
                        string += `<@${user}> is already in the list\n`
                    }
                } else {
                    string += `${user} is invalid user id\n`
                }
            })
            module.exports.editDelete(message, string, config.messageLife * 1000)
        } else {

            let embed = new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`Users in ${listName} list`)
                .setTimestamp()
                .setFooter(`${listName}`, message.client.user.avatarURL())

            getUserList(message, list)
                .then(users => {
                    users.forEach(user => {
                        embed.addField(user.tag === undefined ? user.name : user.tag, user.id)
                    })

                    module.exports.editDelete(message, embed, config.messageLife * 1000)
                })
                .catch(console.error)
        }
    }

    return list
}