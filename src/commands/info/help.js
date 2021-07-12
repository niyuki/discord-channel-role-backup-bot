const client = require('../../niyuki');
const { Client, Message, MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs')
//prefix
const config = require('../../setting.json')
const p = client.prefix
module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Shows all available commands :flushed:',
    cooldown:1000*20,
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
     run: async(client, message, args) => {
        if(!args[0]) {
            let categories = [];
            let x = await client.translate("Missing Command Name!", message)
            readdirSync("./src/commands").forEach((dir) => {
                let array = config.panel.developers

                if(dir == 'owner' && !array.includes(message.author.id.toString())) {
                    return
                }
                const commands = readdirSync(`./src/commands/${dir}/`).filter((file) =>
                    file.endsWith(".js")
                );

                const cmds = commands.map((command) => {
                    let file = require(`../../commands/${dir}/${command}`);

                    if (!file.name) return x

                    let name = file.name.replace(".js", "");
                    
                    return `\`${name}\``;
                });

                let data = new Object() ;

                data = {
                    name: dir.toUpperCase(),
                    value: cmds.length === 0 ? "-" : cmds.join(" "),
                };

                categories.push(data);
            });
            const helpembed = new MessageEmbed()
                .setAuthor(message.guild.name)
                .setThumbnail(message.guild.iconURL({dynamic: true}))
                .setTitle(await client.translate("🥳 Hey Champ.. Do you need help? Anyways here you can see all of my commands:", message))
                .setDescription(await client.translate(`To get more addtional information on a command just type it after \`${p}help\`.\n Anyways hope you enjoy me... 😋`, message))
                .addFields(categories)
                .setColor("RANDOM")
                .setTimestamp()
                .setFooter(await client.translate(`Requested by ${message.author.tag}`, message)+` | Developed by Niyuki`, message.author.avatarURL({dynamic: true}))
            message.lineReply(helpembed)
        } else {
            const command =
              client.commands.get(args[0].toLowerCase()) ||
              client.commands.find(
                (c) => c.aliases && c.aliases.includes(args[0].toLowerCase())
              );
      
            if (!command) {
              const embed = new MessageEmbed()
                .setTitle(await client.translate(`Invalid command! Use \`${p}help\` for all of my commands!`, message))
                .setColor("FF0000");
              return message.lineReply(embed);
            }
      
            const embed = new MessageEmbed()
              .setTitle(await client.translate("Command Details:", message))
              .addField(await client.translate("PREFIX:", message), `\`${prefix}\``)
              .addField(await client.translate(
                "COMMAND:", message),
                command.name ? `\`${command.name}\`` : await client.translate("No name for this command.", message)
              )
              .addField(await client.translate(
                "ALIASES:", message),
                command.aliases
                  ? `\`${command.aliases.join("` `")}\``
                  : await client.translate("No aliases for this command.", message)
              )
              .addField(await client.translate(
                "USAGE:", message),
                command.usage
                  ? `\`${command.usage}\``
                  : `\`${prefix}${command.name}\``
              )
              .addField(await client.translate(
                "DESCRIPTION:", message),
                command.description
                  ? command.description
                  : await client.translate("No description for this command.", message)
              )
              .addField(await client.translate(
                "COOLDOWN:", message),
                command.cooldown
                  ? `\`${command.cooldown}\``
                  : await client.translate(`Dang enjoy because in this command you don't have any cooldowns kekw`, message)
              )
              .setFooter(
                await client.translate(`Requested by ${message.author.tag}`, message),
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setTimestamp()
              .setColor("RANDOM");
            return message.lineReply(embed);
        }
    }
}