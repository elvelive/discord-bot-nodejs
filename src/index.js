const fs = require('fs')
const Discord = require('discord.js')
const { prefix, token } = require('../config/config.json')
const color = require('./colors.js')

const PREFIX = prefix

const client = new Discord.Client()
client.commands = new Discord.Collection()

const commands = fs.readdirSync('src/commands').filter(file => file.endsWith('js'))
for (const file of commands) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}


client.once('ready', () => {
  console.log(color.fgMagenta, `\nLogged in as ${client.user.tag}!`)
  client.user.setPresence({ activity: { name: `&help | Currently serving ${client.guilds.cache.size} servers` }, status: 'online' })
    .then(console.log(color.fgBlue, 'Bot ready for action\n'))
    .catch((err) => console.error(color.fgRed, `An error occured when trying to update bot presence, ${err}`))
})
  


client.on('message', (m) => {
  if (m.author.bot) return

  let date = new Date()

  if (!m.content.startsWith(PREFIX)) {
    console.log(color.fgCyan, `${date.toLocaleDateString()} ${date.toLocaleTimeString()} User [${m.author.tag}] sent message: ${m.content}`)
  } else if (m.content.startsWith(PREFIX)) {
    console.log(color.fgYellow, `${date.toLocaleDateString()} ${date.toLocaleTimeString()} User [${m.author.tag}] called command: ${m.content.trim()}`)
  }

  const args = m.content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  if (!client.commands.has(commandName)) {
    console.error(color.fgRed, `Command &${commandName} not found!\n`)
    m.reply('command not found, are you sure you spelt it right and didn\'t miss any args?')
    return
  }

  const command = client.commands.get(commandName)
  
  try {
    command.execute(m, args)
  } catch (err) {
    console.error(color.fgRed, `Error executing specified command ${command}, ${err}`)
    m.reply('There was an error trying to execute that command!')
  }
})


client.on('rateLimit', (info) =>  {
    console.error(color.fgRed,
      `Rate limit hit ${
        info.timeDifference
          ? info.timeDifference
          : info.timeout
          ? info.timeout
          : 'Unknown timeout'
      }`
    )
})

client.on('shardError', (err) => {
  console.error(color.fgRed, 'A websocket connection encountered an error:', err)
})

client.login(token)