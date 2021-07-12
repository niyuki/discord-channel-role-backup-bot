const { Collection, Client, Discord } = require('discord.js');
require('discord-reply');

const client = global.client = new Client({
    disableMention: 'everyone'
});
const path = require('path')
const fs = require('fs')
const config = require('./setting.json');
module.exports = client;
client.commands = new Collection();
client.prefix = config.panel.prefix;
client.aliases = new Collection();
client.categories = fs.readdirSync(path.resolve('src/commands'));
client.snipes = new Collection();
["command"].forEach(handler => {
    require(path.resolve(`src/handlers/${handler}`))(client);
}); 
//---------------------------SELFDEAF & SELFMUTE
client.on('voiceStateUpdate', async (___, newState) => {
    //---SELFDEAF
    if(
        newState.member.user.bot &&
        newState.channelID &&
        newState.member.user.id == client.user.id && !newState.selfDeaf
    ) return newState.setSelfDeaf(true);
    //---SELFMUTE
    if(
        newState.member.user.bot &&
        newState.channelID &&
        newState.member.user.id == client.user.id && !newState.selfMute
    ) return newState.setSelfMute(true);
})

//---------------------CONNECT MONGO
const ora = require('ora');

const mongoose = require('mongoose');
mongoose.connect(config.panel.mongopath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).catch (error => {
    console.log('I was not able to connect to MongoDB! Please check for any errors.')
    console.log(`Mongo Error: ${error}`)
})

mongoose.connection.on('connected', () => {
    const spinner = ora(`Trying to connect to MongoDB...`).start();

	spinner.succeed('Connected to MongoDB')
})


//------------------------BACKUPS
const moment = require('moment')
const role = require('./models/roledata')
function CreateReserveRole() {
    let reserveguild = client.guilds.cache.get(config.panel.guild);
    if(reserveguild) {
        let allroles = reserveguild.roles.cache.filter(x => x.name !== "@everyone" && !x.managed)

        allroles.forEach(reserver => {

            let rolePermAverage = [];

            let channel = reserveguild.channels.cache.filter(ch => ch.permissionOverwrites.has(reserver.id))

            channel.forEach(ch => {

                let averagePerms = ch.permissionOverwrites.get(reserver.id);

                let datagobrr = { 
                    id: ch.id, 
                    allow: averagePerms.allow.toArray(), 
                    deny: averagePerms.deny.toArray() 
                };

                rolePermAverage.push(datagobrr)
            });

            role.findOne({roleGuild: config.panel.guild, roleID: reserver.id}, async (err, reservedRole) => {
                if (!reservedRole) {
                  let newrole = new role({
                    roleGuild: config.panel.guild,
                    roleID: reserver.id,
                    roleName: reserver.name,
                    roleColor: reserver.hexColor,
                    roleHoist: reserver.hoist,
                    rolePos: reserver.position,
                    roleGeneralPerms: reserver.permissions,
                    roleMention: reserver.mentionable,
                    roleTime: Date.now(),
                    roleUsers: reserver.members.map(m => m.id),
                    roleChannelPerms: rolePermAverage
                  });
                  newrole.save();
                } else {
                    reservedRole.roleName = reserver.name;
                    reservedRole.roleColor = reserver.hexColor;
                    reservedRole.roleHoist = reserver.hoist;
                    reservedRole.rolePos = reserver.position;
                    reservedRole.roleGeneralPerms = reserver.permissions;
                    reservedRole.roleMention = reserver.mentionable;
                    reservedRole.roleTime = Date.now();
                    reservedRole.roleUsers = reserver.members.map(m => m.id);
                    reservedRole.roleChannelPerms = rolePermAverage;
                    reservedRole.save();
                };
              });
            });        

            role.find({ roleGuild: config.panel.guild }).sort().exec((err, rolefilter) => {

                rolefilter.filter(role => 

                    !reserveguild.roles.cache.has(role.roleID) && Date.now() - role.roleTime > 1000*60*30).forEach(x => {

                        role.findOneAndDelete({ roleID: x.roleID });

                    });
            });
     }
}

const channel = require('./models/channeldata')
function CreateReserveChannel() {
    let reserveguild = client.guilds.cache.get(config.panel.guild);
    if(reserveguild) {
        let allchannels = reserveguild.channels.cache.filter(ch => ch.deleted !== true)

        allchannels.forEach(reserver => {
            let ChannelPermAverage = {};
            
            let PermNumber = Number(0);

            reserver.permissionOverwrites.forEach((allperm) => {

                let totalPerm = {};

                allperm.allow.toArray().forEach(p => {

                    totalPerm[p] = true;
                
                });
                allperm.deny.toArray().forEach(p => {

                    totalPerm[p] = false;
                
                });
                
                ChannelPermAverage[PermNumber] = {permission: allperm.id == null ? reserveguild.id : allperm.id, totalPerm };

                PermNumber++;

            })

        

        channel.findOne({ channelGuild: config.panel.guild, channelID: reserver.id }, async(err, reservedChannel) => {
            if(err) throw err;
            if(!reservedChannel) {
                if(reserver.type === 'voice') {

                    let newchannel = new channel({
                        channelGuild: config.panel.guild,
                        channelID: reserver.id,
                        channelName: reserver.name,
                        channelCategory: reserver.parentID,
                        channelPos: reserver.position,
                        channelTime: Date.now(),
                        channelType: reserver.type,
                        channelPerms: ChannelPermAverage,
                        channelUserlimit: reserver.userLimit,
                        channelBitrate: reserver.bitrate
                    });

                    newchannel.save();

                } else if(reserver.type === 'category') {
                    let newchannel = new channel({
                        channelGuild: config.panel.guild,
                        channelID: reserver.id,
                        channelName: reserver.name,
                        channelPos: reserver.position,
                        channelTime: Date.now(),
                        channelType: reserver.type,
                        channelPerms: ChannelPermAverage,
                    });

                    newchannel.save();
                } else {
                    let newchannel = new channel({
                        channelGuild: config.panel.guild,
                        channelID: reserver.id,
                        channelName: reserver.name,
                        channelCategory: reserver.parentID,
                        channelPos: reserver.position,
                        channelTime: Date.now(),
                        channelNsfw: reserver.nsfw,
                        channelType: reserver.type,
                        channelRatelimit: reserver.rateLimitPerUser,
                        channelPerms: ChannelPermAverage,
                        channelUserlimit: reserver.userLimit,
                        channelTopic: reserver.topic ? reserver.topic : "Get good 😳😋"
                    });

                    newchannel.save();
                }
            } else {
                if(reserver.type === 'voice') {
                    reservedChannel.channelName= reserver.name,
                    reservedChannel.channelCategory= reserver.parentID,
                    reservedChannel.channelPos= reserver.position,
                    reservedChannel.channelTime= Date.now(),
                    reservedChannel.channelType=reserver.type,
                    reservedChannel.channelPerms=  ChannelPermAverage,
                    reservedChannel.channelUserlimit= reserver.userLimit,
                    reservedChannel.channelBitrate =  reserver.bitrate
                    reservedChannel.save();
                } else if(reserver.type === 'category') {
                    reservedChannel.channelName= reserver.name,
                    reservedChannel.channelPos= reserver.position,
                    reservedChannel.channelTime= Date.now(),
                    reservedChannel.channelType= reserver.type,
                    reservedChannel.channelPerms= ChannelPermAverage,
                    reservedChannel.save();
                } else {
                    reservedChannel.channelName= reserver.name,
                    reservedChannel.channelCategory= reserver.parentID,
                    reservedChannel.channelPos= reserver.position,
                    reservedChannel.channelTime= Date.now(),
                    reservedChannel.channelNsfw= reserver.nsfw,
                    reservedChannel.channelType= reserver.type,
                    reservedChannel.channelRatelimit= reserver.rateLimitPerUser,
                    reservedChannel.channelPerms= ChannelPermAverage,
                    reservedChannel.channelUserlimit= reserver.userLimit,
                    reservedChannel.channelTopic= reserver.topic ? reserver.topic : "Get good 😳😋"
                    reservedChannel.save();
                }  
            }
        })
        })
        channel.find({ channelGuild: config.panel.guild}).sort().exec((err, channelfilter) => {

            channelfilter.filter(channel => !reserveguild.channels.cache.has(channel.channelID) && Date.now()-channel.channelTime > 1000*60*30).forEach(x => {

              channel.findOneAndDelete({channelID: x.channelID});

            });
        });
    }
}
client.on('ready', () => { 
    const spinner2 = ora(`${client.user.username} is logging in...`).start();
    setTimeout(() => {
        spinner2.succeed(`${client.user.username} has succesfully logged in now.`)
    }, 2500);
    setInterval(() => {
        CreateReserveRole();
        CreateReserveChannel();
        console.log(`Role and Channel Backup Has Been Updated Now! -> [${moment(Date.now()).format('dddd - MM MMMM LT')}] \n Next Update in ${moment(Date.now()).add(1000 * 60 * 30, 'milliseconds')}`)
        let developers = client.users.fetch(config.panel.devs, false).then((user) => {

            user.send(`Role and Channel Backup Has Been Updated Now! -> [${moment(Date.now()).format('dddd - MM MMMM LT')}] \n Next Update in ${moment(Date.now()).add(1000 * 60 * 30, 'milliseconds')}`)
        
        });
    }, 1000 * 60 * 30); 
})


//---------BOT LOGIN


client.login(config.panel.token).catch(err => console.log("Check for correct TOKEN please."))
