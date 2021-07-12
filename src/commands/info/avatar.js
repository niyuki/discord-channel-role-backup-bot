const { Client, Message, MessageEmbed } = require('discord.js');
const config = require('../../setting.json')

module.exports = {
    name: 'avatar',
    aliases: ['av'],
    description: 'Shows Avatar',
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async(client, message, args) => {
        let user = message.mentions.users.first() ||  message.guild.members.cache.get(args[1]) || message.author;
        message.lineReply( new Discord.MessageEmbed()
        .setAuthor(user.username,user.avatarURL())
        .setColor("RANDOM")
        .setDescription(`**[Avatar Link](${user.avatarURL({dynamic: true})})**`)
        .setImage(user.avatarURL(
        {dynamic : true,
        format : 'png',
        size : 1024}
        ))
        );
        
    }
}