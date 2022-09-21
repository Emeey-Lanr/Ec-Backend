const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const PORT = process.env.PORT
let connection = app.listen(PORT, () => console.log(`connection @ ${PORT}`))
const socketIo = require('socket.io')
const io = socketIo(connection, { cors: { option: "*" } })
const cors = require('cors')
const URI = process.env.URI
mongoose.connect(URI, (err) => {
    if (err) {
        console.log(`mongose not connected`)
    } else {
        console.log(`mongose has connected`)
    }
})
app.use(express.urlencoded({ extended: true, limit: "100mb" }))
app.use(cors())
app.use(express.json())
const route = require('./Routes/user')
app.use('/user', route)




io.on('connection', (socket) => {
    console.log(`a user has connected ${socket.id}`)

    socket.on('sendName', (data) => {
        console.log(data)
        socket.emit('message', { name: data.name, id: socket.id })
    })
    socket.on('disconnection', () => {
        console.log(`a user has disconnected ${socket.id}`)
    })
})














