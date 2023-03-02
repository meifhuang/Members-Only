const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message =
    new Schema({
        title: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
    })

module.exports = mongoose.model("Message", Message);
