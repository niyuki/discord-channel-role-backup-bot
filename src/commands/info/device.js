const { Client, Message, MessageEmbed } = require('discord.js');
const config = require('../../setting.json')

module.exports = {
    name: 'device',
    aliases: ['devices'],
    description: 'Check user device',
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async(client, message, args) => {
        const user = message.mentions.users.last() || message.author;

        const devices = user.presence?.clientStatus || {};

        const description = () => {
        
                const entries = Object.entries(devices)
                    .map((value, index) => `${index+1}.) \`${value[0][0].toUpperCase()}${value[0].slice(1)}\` `)
                    .join("\n");
                return `Devices:\n${entries}`
            
        }
        const deviceembed = new MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setDescription(description()+'\n \`\`\` Devices logged in: '+ Object.entries(devices).length +' \`\`\` ')
            .setColor('RANDOM')
        
        message.lineReply(deviceembed)
    }
}