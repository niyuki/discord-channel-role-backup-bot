const { Client, Message, MessageEmbed } = require('discord.js');
const config = require('../../setting.json')
const RoleBackup = require('../../models/roledata')
module.exports = {
    name: 'rolebackup',
    aliases: ['role-backup', 'role-bu','role-setup'],
    description: 'Sets up back the role with saved datarole',
    usage: '.rolebackup <roleid>',
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
        
        if(!args[0] || isNaN(args[0]) || !parseInt(args[0])) return message.lineReply(niyukited.setDescription('You have to provide an valid \`RoleID\`').setColor('4a0000')).then(x=> x.delete({timeout:7500}))

        RoleBackup.findOne({roleGuild: config.panel.guild, roleID: args[0]}, async (err, datarole) => {
            
            if(err) throw err;
            
            if(!datarole) return message.lineReply(niyukited.setDescription('The ID you just provided is not available on the datarolebase. Make sure you entered the correct RoleID and probably recheck if it is saved on datarolebase').setColor('4a0000'))
            
            await message.lineReply({embed: niyukited.setColor(config.embed.color).setDescription(`Hey Champ, looks like you want me to recreate the Role **${datarole.roleName}** - \`(${datarole.roleID})\`\n \`I will make the same permissions and add to the users before!\` \n \`\`\` If you approve this just click on the ✅ below!\`\`\` `)}).then(tedniyuki => {
                
                tedniyuki.react("✅")

                const confirmation = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id;

                const devcollect = tedniyuki.createReactionCollector(confirmation, { time: 120000 });

                devcollect.on("collect", async role => {
                    setTimeout(async function(){
                        tedniyuki.delete()

                        let setrole = await message.guild.roles.create({
                            data: {
                                name: datarole.roleName,
                                color: datarole.roleColor,
                                hoist: datarole.roleHoist,
                                permissions: datarole.roleGeneralPerms,
                                position: datarole.rolePos,
                                mentionable: datarole.roleMention
                            },
                            reason: "Niyuki Role Backup Procedure | Niyuki x .." 
                        });

                        setTimeout(() => {
                            let channelPerms = datarole.roleChannelPerms;
                            
                            if(channelPerms) channelPerms.forEach((perms, index) => {
                                
                                let channel = message.guild.channels.cache.get(perms.id);
                                
                                if(!channel) return;
                                
                                setTimeout(() => {

                                    let newChannelPerms = {};

                                    perms.allow.forEach(x => {
                                        newChannelPerms[x] = true;
                                    });

                                    perms.deny.forEach(x => {
                                        newChannelPerms[x] = false;
                                    });

                                    channel.createOverwrite(setrole, channelPerms).catch(err => console.log('I can unfortunately guess we messed up something while overwriting channel perms.'));
                                }, index*7500);
                            })
                        }, 7500);

                        let roleUser = datarole.roleUsers;

                        roleUser.forEach((user, index) => {

                            let member = message.guild.members.cache.get(user)

                            if(!member || member.roles.cache.has(setrole.id)) return;
                            
                            setTimeout(() => {
                                member.roles.add(setrole.id).catch(err => console.log('I received this error while trying to spread the Backup Role: '+err))
                            }, index*2750);
                        })

                        let log = client.channels.cache.get(config.channellist.logchannel)
                        
                        if(log) {
                            log.send(new MessageEmbed().setColor('00ff4a').setDescription(`${message.author} - (\`${message.author.id}\`) => Created the role **${datarole.roleName}** (\`${datarole.roleID}\`) \n \`\`\` The role will be created on the server with the same settings and distributed to the members!\`\`\` `).setAuthor('Used Role Backup', message.guild.iconURL({dynamic:true})).setTimestamp().setFooter(config.embed.footer)).catch()
                        } else {
                            message.guild.owner.send(new MessageEmbed().setColor('00ff4a').setDescription(`${message.author} - (\`${message.author.id}\`) => Created the role **${datarole.roleName}** (\`${datarole.roleID}\`) \n \`\`\` The role will be created on the server with the same settings and distributed to the members!\`\`\` `).setAuthor('Used Role Backup', message.guild.iconURL({dynamic:true})).setTimestamp().setFooter(config.embed.footer)).catch()
                        }
                    }, 850)
                })
            })

                
        })
    }
}