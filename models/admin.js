const mongoose = require("mongoose");

const AddAdminSchema = new mongoose.Schema({
  role: {
    type: String,
    default: "admin",
  },
  name: {
    type: String,
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

const Admin = mongoose.model("admin", AddAdminSchema);
module.exports = Admin;
