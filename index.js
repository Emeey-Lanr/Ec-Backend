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
io.on('connection', (socket) => {

    console.log(`a user has connected ${socket.id} `)
    ///sends the user id back to the clinet side
    // socket.emit('user-id', { userid: socket.id, status: true })
    // the server recieve the user username nad id back and gets it stored in an array
    socket.on('userDetails', (info) => {
        console.log(info)
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
            socket.emit('messageSent', userSchema.one)
            console.log(chatBox)
        }


    })
    socket.on('chatWith', (messageChat) => {

        reciever = messageChat.recieverInfo
        //bi communication  commes the two concatinated name, the reverse and the non revese
        ///If filters it to find the two box and pushes the message, time inside
        biChatBox = chatBox.filter((chatb, id) => chatb.uniqueId === messageChat.pairId || chatb.uniqueId === messageChat.reversepairId)
        biChatBox[0].messages.push({ recieverName: reciever, message: messageChat.message, time: messageChat.time })
        biChatBox[1].messages.push({ recieverName: reciever, message: messageChat.message, time: messageChat.time })
        console.log(biChatBox[0], biChatBox[1])
        ///It looks for the ids of the chatboxes 
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
        //it then updates it with with the original ones
        chatBox[id1] = biChatBox[0]
        chatBox[id2] = biChatBox[1]

        ///We search if the user is online or not, if online, it recieves the message instantly at the particular id
        receivingUser = userIdentification.filter((usersOnline, id) => usersOnline.username === messageChat.recieverInfo)
        sendingUser = userIdentification.filter((usersOnline, id) => usersOnline.username === messageChat.senderInfo)
        if (receivingUser.length > 0) {
            // socket.to(receivingUser[0].userid).emit('messageSent', chatBox[id1])
            // socket.to(sendingUser[0].userid).emit('messageSent', chatBox[id2])
            socket.to(receivingUser[0].userid).to(sendingUser[0].userid).emit('messageSent', chatBox[id1])

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


    socket.on('disconnection', () => {
        //It removes the user that get disconnected from the chat from the useridentification array
        console.log(`a user has disconnected ${socket.id}`)
        let user = userIdentification.filter((user, id) => user.userid !== socket.id)
        userIdentification = user

    })
})














