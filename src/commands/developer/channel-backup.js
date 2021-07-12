const { Client, Message, MessageEmbed } = require('discord.js');
const config = require('../../setting.json')
const ChannelBackup = require('../../models/channeldata')
module.exports = {
    name: 'channelbackip',
    aliases: ['channel-backup', 'channel-bu','channel-setup'],
    description: 'Sets up back the channel with saved datachannel',
    usage: '.channelbackup <channelid>',
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async(client, message, args) => {
        if(!config.channellist.developerchannel.includes(message.channel.id.toString())) return message.react('😞')
        
        let array = (config.panel.devs)
        if(!array.includes(message.author.id.toString())) return message.react('❌')
        
        const niyukited = new MessageEmbed().setFooter(config.embed.footer).setAuthor(message.author.username, message.author.displayAvatarURL()).setTimestamp()
        
        if(!args[0] || isNaN(args[0]) || !parseInt(args[0])) return message.lineReply(niyukited.setDescription('You have to provide an valid \`ChannelID\`').setColor('4a0000')).then(x=> x.delete({timeout:7500}))

        ChannelBackup.findOne({channelGuild: config.panel.guild, channelID: args[0]}, async (err, datachannel) => {
            
            if(err) throw err;
            
            if(!datachannel) return message.lineReply(niyukited.setDescription('The ID you just provided is not available on the database. Make sure you entered the correct ChannelID and probably recheck if it is saved on database').setColor('4a0000'))
            
            await message.lineReply({embed: niyukited.setColor(config.embed.color).setDescription(`Hey Champ, looks like you want me to recreate the Channel **${datachannel.channelName}** - \`(${datachannel.channelID})\`\n \`I will create same settings like it had before\` \n \`\`\` If you approve this just click on the ✅ below!\`\`\` `)}).then(tedniyuki => {
                
                tedniyuki.react("✅")

                const confirmation = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id;

                const devcollect = tedniyuki.createReactionCollector(confirmation, { time: 120000 });

                devcollect.on("collect", async role => {
                    setTimeout(async function(){

                        tedniyuki.delete()

                        message.guild.channels.create(datachannel.channelName, {type: datachannel.channelType}).then(ch => {
                            if(ch.type === "voice"){
                                ch.setBitrate(datachannel.channelBitrate)
                                ch.setParent(datachannel.channelCategory)
                                ch.setPosition(datachannel.channelPos)
                                ch.setUserLimit(datachannel.channelUserlimit);

                                if(Object.keys(datachannel.channelPerms[0]).length > 0 ){

                                    for (
                                        let info = 0;

                                        info < Object.keys(datachannel.channelPerms[0]).length;

                                        info++
                                        ) {
                                            ch.createOverwrite(datachannel.channelPerms[0][info].permission, datachannel.channelPerms[0][info].thisPermOverwrites);
                                        }
                                }
                            } else if(ch.type === "category"){
                                if(Object.keys(datachannel.channelPerms[0]).length > 0 ){

                                    for (
                                        let info = 0;

                                        info < Object.keys(datachannel.channelPerms[0]).length;

                                        info++
                                        ) {
                                            ch.createOverwrite(datachannel.channelPerms[0][info].permission, datachannel.channelPerms[0][info].thisPermOverwrites);
                                        }
                                }
                            } else {
                                ch.setRateLimitPerUser(datachannel.channelRatelimit);
                                ch.setTopic(datachannel.channelTopic);
                                ch.setParent(datachannel.channelCategory);
                                ch.setPosition(datachannel.channelPos);

                                if(Object.keys(datachannel.channelPerms[0]).length > 0 ){

                                    for (
                                        let info = 0;

                                        info < Object.keys(datachannel.channelPerms[0]).length;

                                        info++
                                        ) {
                                            ch.createOverwrite(datachannel.channelPerms[0][info].permission, datachannel.channelPerms[0][info].thisPermOverwrites);
                                        }
                                }
                            }
                        })
                        let log = client.channels.cache.get(config.channellist.logchannel)
                        
                        if(log) {
                            log.send(new MessageEmbed().setColor('00ff4a').setDescription(`${message.author} - (\`${message.author.id}\`) => Created the channel **${datachannel.channelName}** (\`${datachannel.channelID}\`) \n \`\`\` The role will be created on the server with the same settings and distributed to the members!\`\`\` `).setAuthor('Used Role Backup', message.guild.iconURL({dynamic:true})).setTimestamp().setFooter(config.embed.footer)).catch()
                        } else {
                            message.guild.owner.send(new MessageEmbed().setColor('00ff4a').setDescription(`${message.author} - (\`${message.author.id}\`) => Created the channel **${datachannel.channelName}** (\`${datachannel.channelID}\`) \n \`\`\` The role will be created on the server with the same settings and distributed to the members!\`\`\` `).setAuthor('Used Role Backup', message.guild.iconURL({dynamic:true})).setTimestamp().setFooter(config.embed.footer)).catch()
                        }
                    }, 850)
                })
            })

                
        })
    }
}