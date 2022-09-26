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
app.use(express.json())
const route = require('./Routes/user')
app.use('/user', route)


let status = false
let userIdentification = []
let chatBox = []
io.on('connection', (socket) => {
    console.log(`a user has connected ${socket.id}`)

    socket.emit('user-id', { userid: socket.id })
    socket.on('userDetails', (info) => {
        userIdentification.map((users, id) => {
            if (users.userName.indexOf(info.username) > -1) {
                console.log('user already exist')
            } else {
                userIdentification.push(info)
            }
        })

        console.log(userIdentification)

    })
    socket.on('userSchema', (userSchema) => {
        let uniquepair = userSchema.uniqueId
        chatBox.map((chatb, id) => {
            if (chatb.uniqueId.indexOf(uniqueId) > -1) {
                console.log('box already exist')
            } else {
                chatBox.push(userSchema)
            }
        })

    })
    socket.on('chatwith', (messageChat) => {
        let m = userIdentification.find((users, id) => users.username === messageChat.recieverInfo)
        console.log(m)
    })


    socket.on('disconnection', () => {
        console.log(`a user has disconnected ${socket.id}`)
    })
})














