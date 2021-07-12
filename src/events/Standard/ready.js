const client = require('../../niyuki');
const config = require('../../setting.json')

client.on('ready', async(message) => {
    //--------------LOG IF BOT IS ONLINE
    console.log('<==============================================>')
    //--------JOIN VOICE CHANNEL
    const ora = require('ora')
    const spinner2 = ora(`${client.user.username} is trying to join the VoiceChannel...`).start();

    let voice = client.channels.cache.get(config.channellist.voicechannel)
    if(voice) {
      voice.join().catch(console.error)
      setTimeout(() => {
        spinner2.succeed(`${client.user.username} has succesfully joined the VoiceChannel`)
      }, 0);
    }

    //--------BOT PRESENCE STATUS
    client.user.setPresence({ activity: { name: '💸 Niyuki x .. 💸' , type: 'STREAMING', url:'https://github.com/niyuki'}, status: 'dnd'/*online, idle, dnd, invisible */ })
    //.then(console.log)
      .catch(console.error);  

})