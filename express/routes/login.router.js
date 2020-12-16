const bcryptjs = require('bcryptjs')
const db = require('../services/db/db.service')
const express = require('express')
const router = express.Router()

router.post('/', async function (req, res) {
    await db.init()
    let username = req.body.username
    let password = req.body.password
    if (!username || !password) {
        res.sendStatus(400)
        return
    }
    let user = await db.getUser(username)
    if (user == null) {
        res.send({ result: false })
        return
    }
    let authenticated = bcryptjs.compareSync(password, user.password)
    if (!authenticated) {
        res.send({ result: false })
        return
    }
    delete user.password
    res.send({ result: true, user })
})

module.exports = router
