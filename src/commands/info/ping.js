const { MessageEmbed } = require('discord.js')
const config = require('../../setting.json')
const pm = require('pretty-ms');


module.exports = {
  name: 'ping',
  aliases: [],
  category: ['Info'],
  usage: '.ping',
  description: 'Ping but with more swag B)',
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
  async run(client, message, args) {

   const msg = await message.lineReply("🏓 Pinging...");

    const botLatency = pm(msg.createdTimestamp - message.createdTimestamp)
    const shardLatency = pm(message.guild.shard.ping);
    
    const embed = new MessageEmbed()
      .setAuthor('🏓Pong!')
      .addFields({
          name: 'Message Latency:',
          value: `${botLatency}`,
          inline: true
        }, {
          name: `Shard | ${message.guild.shard.id} Latency:`,
          value: `${shardLatency}`,
          inline: true
        })

    await msg.edit(embed)
  }
}