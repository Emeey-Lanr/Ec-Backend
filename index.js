const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const PORT = process.env.PORT

let connection = app.listen(PORT, () => console.log(`connection @ ${PORT}`))
const socketIo = require('socket.io')
const io = socketIo(connection, { cors: { option: "*" } })
const URI = process.env.URI
mongoose.connect(URI, (err) => {
    if (err) {
        console.log(`mongose not connected`)
    } else {
        console.log(`mongose has connected`)
    }
})
app.use(express.urlencoded({ extended: true, limit: "100mb" }))
const cors = require('cors')
app.use(cors())
app.use(express.json({ limit: "100mb" }))
const route = require('./Routes/user')
app.use('/user', route)

const ChatModel = require("./model/chatmodel")



let status = false
let userIdentification = [
    {
        username: 'c*',
        userid: 'c*'
    }
]
let chatBox = []
let user = []
let recieverId = ''
let reciever = ""
let biChatBox = []
let id1 = 0
let id2 = 0
let chatListBox = []
let user1 = ""
let user2 = ""
// app.post("/chat/saveChatDetails", (req, res) => {


io.on('connection', (socket) => {

    console.log(`a user has connected ${socket.id} `)
    ///sends the user id back to the clinet side
    // socket.emit('user-id', { userid: socket.id, status: true })
    // the server recieve the user username nad id back and gets it stored in an array
    socket.on('userDetails', (info) => {
        console.log(info)
        const saveInfo = () => {

            let m = "Ec-Chat-collection"
            let chat = {
                ecChatIdentification: "Ec-Chat-collection",
                messagesBox: []
            }
            let chatForm = new ChatModel(chat)
            ChatModel.findOne({ ecChatIdentification: m }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    if (result) {
                        chatBox = result.messagesBox
                        console.log(result, 'able to find')
                    } else {
                        chatForm.save((err, result) => {
                            if (err) {
                                console.log('unable, to save')
                            } else {
                                result
                                console.log(result, 'able to save')
                            }
                        })
                    }
                }
            })
        }
        saveInfo()
        if (userIdentification.find((users, id) => users.username === info.username)) {
            console.log('user already exist')
        } else {
            userIdentification.push(info)
            socket.emit('info', userIdentification)
        }

    })



    ///The schema gets saved and that where the messges are being push into
    socket.on('userSchema', (userSchema) => {
        let uniquepair = userSchema.one.uniqueId
        //If finds to the concatinated name, being sent here
        if (chatBox.find((chatb, id) => chatb.uniqueId === uniquepair)) {
            //If found, it checks for the chatbox, and emit their previous conversation  the chat space
            chatBox.map((users, id) => {
                if (users.uniqueId === uniquepair) {
                    socket.emit('messageSent', users)
                }
            })

        } else {
            ///else it pushes the new name into the chatbox
            chatBox.push(userSchema.one)
            chatBox.push(userSchema.two)
            // user1 = userSchema.one.user
            // user2 = userSchema.two.user
            socket.emit('messageSent', userSchema.one)
            console.log(chatBox)
        }


    })
    socket.on('chatWith', (messageChat) => {

        reciever = messageChat.recieverInfo
        //bi communication  comes with the two concatinated name, the reverse and the non revese
        ///It filters it to find the two box and pushes the message, time inside
        biChatBox = chatBox.filter((chatb, id) => chatb.uniqueId === messageChat.pairId || chatb.uniqueId === messageChat.reversepairId)

        biChatBox[0].messages.push({ recieverName: reciever, message: messageChat.message, time: messageChat.time })
        biChatBox[1].messages.push({ recieverName: reciever, message: messageChat.message, time: messageChat.time })

        console.log(biChatBox[0], biChatBox[1])
        ////if a user sends sends a message to another person it records the length when that usermessage stays at zero, 
        ////the person receiving it, gets the number of message being pushed before it replies, if he or she then replies the number stays at 
        //zero again
        // let firstUser = biChatBox[0].message.filter((user, id) => user.recieverName === messageChat.senderInfo)
        // let seconduser = biChatBox[1].message.filter((user, id) => user.reciever !== messageChat.recieverInfo)
        biChatBox[0].messagesNumber = 0
        biChatBox[1].messagesNumber = biChatBox[1].messagesNumber + 1
        ///It looks for the ids of the chatbox of the user and the person he or she is chatting with


        chatBox.map((user, id) => {
            if (user.uniqueId === messageChat.pairId) {
                id1 = id

            }
        })
        chatBox.map((user, id) => {
            if (user.uniqueId === messageChat.reversepairId) {
                id2 = id

            }
        })
        console.log(id1, id2)
        //it then updates the chatboxes with with the original ones
        chatBox[id1] = biChatBox[0]
        chatBox[id2] = biChatBox[1]
        const updateChat = () => {
            ChatModel.findOneAndUpdate({ ecChatIdentification: 'Ec-Chat-collection' }, { ecChatIdentification: 'Ec-Chat-collection', messagesBox: chatBox }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('able to update')
                }
            })
        }
        updateChat()


        ///We search if the user is online or not, if online, it recieves the message instantly at the particular id
        receivingUser = userIdentification.filter((usersOnline, id) => usersOnline.username === messageChat.recieverInfo)
        sendingUser = userIdentification.filter((usersOnline, id) => usersOnline.username === messageChat.senderInfo)
        if (receivingUser.length > 0) {
            socket.to(receivingUser[0].userid).emit('messageSent', chatBox[id1])
            socket.emit('messageSentRecieved', chatBox[id2])
            // socket.to(receivingUser[0].userid).to(sendingUser[0].userid).emit('messageSent', chatBox[id1])

        } else {
            socket.emit('messageSent', chatBox[id1])
        }

    })
    ///Chat List
    let chatListPre = []
    socket.on('chatList', (info) => {
        chatListPre = chatBox.filter((users, id) => users.user == info.user)
        chatListBox = chatListPre.filter((user, id) => user.messages.length > 0)
        console.log(chatListBox)
        socket.emit('chatListList', chatListBox)
    })

    //Open the chatList
    socket.on("createdChat", (name) => {
        console.log(name)
        let user = chatBox.filter((user, id) => user.uniqueId === name.uniqueId)
        console.log(user)
        socket.emit('userTracked', user[0])
    })

    socket.on('disconnect', () => {
        //It removes the user that get disconnected from the chat from the useridentification array
        console.log(`a user has disconnected ${socket.id}`)
        let userDisconnected = userIdentification.filter((user, id) => user.userid === socket.id)
        console.log(userDisconnected)
        let user = userIdentification.filter((user, id) => user.userid !== socket.id)
        userIdentification = user


    })
})

















