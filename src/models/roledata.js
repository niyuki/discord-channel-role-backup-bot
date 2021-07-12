const mongoose = require('mongoose');

let role = new mongoose.Schema({
    roleGuild: String,
    
    roleID: String,
    roleName: String,

    roleColor: String,
    roleHoist: Boolean,
    rolePos: Number,
    roleGeneralPerms: Number,
    roleMention: Boolean,
    roleTime: Number,
    roleUsers: Array,
    roleChannelPerms: Array
})

module.exports = mongoose.model('role', role)