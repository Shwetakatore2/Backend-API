const mongoose = require("mongoose");
// const { Schema } = mongoose;

const AddNewUserSchema = new mongoose.Schema({
  roles: {
    type: Array,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const User = mongoose.model("user", AddNewUserSchema);
module.exports = User;
