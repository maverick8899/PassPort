const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(async function connect() {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/Authentication");
    console.log("connect succeeded");
  } catch (error) {
    console.log("connect failed");
  }
})();

const UserSchema = new Schema({
  email: { type: String, lowercase: true, unique: true, require: true },
  password: { type: String, require: true },
  role: { type: String, enum: ["user", "manager", "admin"], default: "user" },
});

module.exports = mongoose.model("account", UserSchema);
