const db = require('../services/db/db.service')
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')

function generateUniqueId(length = 8) {
    id = uuidv4().toString(36).slice(0, length)
    return id
}

router.post('/create', async function (req, res) {
    console.log(`/room/create`)
    let roomName = req.body.roomName
    let email = req.body.email
    let organizer = req.body.organizer
    let deadline = req.body.deadline
    let budget = req.body.budget
    let background = req.body.background
    if (!organizer || !roomName || !email || !deadline || !budget || !background) {
        res.send({ result: false })
        return
    }
    await db.init()
    let data = {
        roomId: generateUniqueId(),
        roomName,
        email,
        organizer,
        deadline,
        budget,
        background
    }
    let roomInfo = await db.createRoom(data)
    if (!roomInfo) {
        res.send({ result: false })
        return
    }
    let members = await db.getAllUsersInRoom(data.roomId, organizer)
    roomInfo.members = members
    res.send({ 
        result: true,
        roomInfo: roomInfo
    })
})

router.post('/join', async function (req, res) {
    console.log(`/room/join : ${req.body.roomId}`)
    let roomId = req.body.roomId
    let username = req.body.username
    let email = req.body.email
    if (!roomId || !username || !email) {
        res.send({ result: false })
        return
    }
    await db.init()

    let user = await db.getUser(username)
    if (!user) {
        res.send({ result: false })
        return
    }
    try {
        let roomInfo = await db.joinRoom(roomId, username, email, user.avatar)
        if (!roomInfo) {
            res.send({ result: false })
            return
        }
        let members = await db.getAllUsersInRoom(roomId, username)
        roomInfo.members = members
        res.send({ result: true, roomInfo: roomInfo })
    } catch (e) {
        console.log(e)
        res.send({ result: false })
    }
})

router.post('/updateWish', async function (req, res) {
    console.log(`/room/updateWish : ${req.body.username}`)
    let username = req.body.username
    let roomId = req.body.roomId
    let wish = req.body.wish
    if (!username || !roomId || !wish || wish === '') {
        res.send({ result: false })
        return
    }
    await db.init()

    let user = await db.getUser(username)
    if (!user) {
        res.send({ result: false })
        return
    }
    try {
        let q = await db.updateWish(roomId, username, wish)
        res.send({ result: q })
    } catch (e) {
        console.log(e)
        res.send({ result: false })
    }
})

router.get('/check', async function (req, res) {
    console.log(`/room/check : ${req.query.roomId}`)
    let roomId = req.query.roomId
    if (!roomId || roomId === '') {
        res.send({ result: false })
        return
    }
    await db.init()
    try {
        let q = await db.checkRoomExists(roomId)
        res.send({ result: q })
    } catch (e) {
        console.log(e)
        res.send({ result: false })
    }
})

module.exports = router
