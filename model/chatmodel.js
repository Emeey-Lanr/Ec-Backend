const mongoose = require('mongoose')
const ChatSchema = mongoose.Schema({
    ecChatIdentification: { type: String },
    messagesBox: { type: Array }

})

const ChatModel = mongoose.model('chat-collection', ChatSchema)



module.exports = ChatModel