const mongoose = require('mongoose');

const brandingServicesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description:{
    type:String,
    required:true,
  },
  url: {
    type: String,
    optional: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('branding-services', brandingServicesSchema);
