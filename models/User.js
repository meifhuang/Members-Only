const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User =
    new Schema({
        first: { type: String, required: true },
        last: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        member: { type: Boolean, default: false }
    })

module.exports = mongoose.model("User", User);
