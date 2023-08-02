const mongoose = require("mongoose");

const UserManagementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  
});
module.exports = mongoose.model("usermanagement", UserManagementSchema);
