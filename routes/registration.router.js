const bcryptjs = require('bcryptjs')
const db = require('../services/db/db.service')
const express = require('express')
const router = express.Router()

const saltRounds = 12

router.post('/', async function (req, res) {
    await db.init()
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let avatar = req.body.avatar
    if (!username || !password || !email || !avatar) {
        res.status(400).send({ result: false })
        return
    }
    let valid = await db.checkUsernameValid(username)
    if (!valid || valid == null) {
        res.send({ result: false })
        return
    }
    let hash = bcryptjs.hashSync(password, saltRounds)
    let data = {
        username,
        password: hash,
        email,
        avatar
    }
    try {
        await db.insertUser(data)
    } catch (e) {
        res.sendStatus(500)
        return
    }
    res.send({ result: true })
})

router.get('/', async function (req, res) {
    await db.init()
    let username = req.query.username
    if (!username) {
        res.send({ result: false })
        return
    }
    let valid = await db.checkUsernameValid(username)
    res.send({ result: valid != null && valid })
})

module.exports = router
