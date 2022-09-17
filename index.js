const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const PORT = proces.env.PORT
const socket = require('socket.io')
let portConection = app.listen(PORT)
const io = socket(portConection, { cors: { options: "*" } })

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())


io.on('connection', (socket) => {
    console.log('a user has connected')
    socket.on('disconnet', () => {
        console.log('a user has diconnected')
    })
})
















