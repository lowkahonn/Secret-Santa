const bcryptjs = require('bcryptjs')
const db = require('../db/db.service')
const express = require('express')
const router = express.Router()

const saltRounds = 12

router.post('/', async function (req, res) {
    await db.init()
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    if (!username || !password || !email) {
        res.sendStatus(400)
    }
    let valid = await db.checkUsernameValid(username)
    if (!valid) {
        res.send({ result: false })
        return
    }
    let hash = bcryptjs.hashSync(password, saltRounds)
    let data = {
        username,
        password: hash,
        email
    }
    try {
        await db.insertUser(data)
    } catch (e) {
        res.sendStatus(500)
        return
    }
    res.send({ result: true })
})

module.exports = router
