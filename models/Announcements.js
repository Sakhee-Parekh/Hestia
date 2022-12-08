const mongoose = require('mongoose') //mongodb

const Schema = mongoose.Schema
const announcementsSchema = new Schema({
  text: {
    type: String,
    required: true,
    default: 'test'
  },
  creation_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  approval: {
    type: String,
    required: true,
    default: "false"
  },
  creator: {
    type: String,
    required: true,
    default: 'No creator set'
  },
  id_code: {
    type: Number,
    required: true,
    default: Date.now()
  }
})

module.exports = Item = mongoose.model('announcements', announcementsSchema)