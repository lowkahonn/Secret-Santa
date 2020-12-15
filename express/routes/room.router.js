const db = require('../services/db/db.service')
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')

function generateUniqueId(length = 8) {
    id = uuidv4().toString(36).slice(0, length)
    console.log(id)
    return id
}

router.post('/create', async function (req, res) {
    let roomName = req.body.roomName
    let email = req.body.email
    let organizer = req.body.organizer
    let deadline = req.body.deadline
    let budget = req.body.budget
    if (!organizer || !roomName || !email || !deadline || !budget) {
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
        budget
    }
    let q = await db.createRoom(data)
    if (!q) {
        res.send({ result: false })
        return
    }
    res.send({ 
        result: true,
        roomId: data.roomId
    })
})

router.post('/join', async function (req, res) {
    let roomId = req.body.invitationCode
    let username = req.body.username
    let email = req.body.email
    if (!roomId || !username || !email) {
        res.send({ result: false })
        return
    }
    await db.init()
    let exists = await db.checkRoomExists(roomId)
    if (!exists) {
        res.send({ result: false })
        return
    }
    try {
        let q = await db.joinRoom(roomId, username, email)
        if (!q.rows.length) {
            res.send({ result: false })
            return
        }
        let roomInfo = q.rows[0]
        roomInfo.deadline = roomInfo.timezone
        delete roomInfo.timezone
        res.send({ result: true, roomInfo: roomInfo })
    } catch (e) {
        console.log(e)
        res.send({ result: false })
    }
})

// TODO: get room info

module.exports = router
