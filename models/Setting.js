const mongoose = require('mongoose');

const SettingSchema = mongoose.Schema({
    name:{
        type:String,
    },
    username:{
        type:String,
    },
    currentPassword:{
        type:String,
    },
    changePassword:{
        type:String,
    },
    profilePic:{
        data:Buffer,
        contentType:String,
    }
})

module.exports = SettingModel = mongoose.model('settingModel',SettingSchema);