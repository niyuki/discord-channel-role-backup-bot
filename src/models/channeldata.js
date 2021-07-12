const mongoose = require('mongoose');

let channel = new mongoose.Schema({
    channelGuild: String,

    channelID: String,
    channelName: String,
    channelCategory: String,

    channelPos: Number,
    channelPerms: Array,
    channelNsfw: Boolean,
    channelRatelimit: Number,
    channelTopic: String,
    channelType: String,
    channelTime: Number,
    channelUserlimit: Number,
    channelBitrate: Number,
})

module.exports = mongoose.model('channel', channel)