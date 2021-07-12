const client = require('../../niyuki')
const prefix = client.prefix;
const { Collection, MessageEmbed } = require('discord.js');
const Timeout = new Collection();
const ms = require('ms')
const config = require('../../setting.json')

client.on('message', async message =>{
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    if(!message.guild) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if(cmd.length == 0 ) return;
    let command = client.commands.get(cmd)
    if(!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) {
        if(command.cooldown) {
            if(Timeout.has(`${command.name}${message.author.id}`)) return message.lineReply(await client.translate(`You are on cooldown of \`${ms(Timeout.get(`${command.name}${message.author.id}`) - Date.now(), {long : true})}\` .`),message)
            command.run(client, message, args)
            Timeout.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
            setTimeout(() => {
                Timeout.delete(`${command.name}${message.author.id}`)
            }, command.cooldown)
        } else {
            command.run(client, message, args)
            client.channels.cache.get(config.channellist.CommandLog).send(new MessageEmbed()
                .setTitle(`Used Command: ${command.name}`)
                .setDescription(`${message.author.tag} user used the command ${command.name}! Command was used in this channel: ${message.channel.name}`)
                .setColor('#fff5ee')
                .setFooter('🔥 Niyuki On Fire 🔥'))
    }}
});