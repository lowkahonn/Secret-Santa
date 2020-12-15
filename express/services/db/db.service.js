const { Client } = require('pg')
const { scheduleJob } = require('node-schedule')
const Mailer = require('../email/mailer.service')
require('dotenv').config()

const client = new Client({
    connectionString: process.env.DATABASE_URL
})
client.connect()

let inited = false
const USER_TABLE = 'users'
const ROOMS_TABLE = 'rooms'
const USER_TABLE_FIELDS = ['username', 'password', 'email']
const ROOM_TABLE_FIELDS = ['username', 'email']
const ROOMS_TABLE_FIELDS = ['room_id', 'room_name', 'organizer', 'deadline', 'budget']
const ROOMS_TABLE_QUERY_FIELDS = ['room_id', 'room_name', 'organizer', `deadline::timestamp at time zone 'UTC'`, 'budget']

async function query(table, fields, condition = null) {
    fields = fields.join(',')
    if (condition != null) {
        return await client.query(`SELECT ${fields} FROM ${table} WHERE ${condition}`)
    }
    return await client.query(`SELECT ${fields} FROM ${table}`)
}

async function insert(table, fields, values) {
    fields = fields.join(',')
    values = values.map(v => `'${v}'`).join(',')
    return await client.query(`INSERT INTO ${table} (${fields}) VALUES(${values})`)
}

async function createRoomTable(roomId) {
    return await client.query(`CREATE TABLE room.room${roomId} (` +
        'id SERIAL PRIMARY KEY,' +
        'username VARCHAR(64) NOT NULL,' +
        'email VARCHAR(128) NOT NULL,' +
        'FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE' +
    ')')
}

async function checkIfUserExistsInRoom(username, roomId) {
    return await client.query(`SELECT username FROM room.room${roomId} WHERE username='${username}'`)
}

function getRoomTable(roomId) {
    return `room.room${roomId}`
}

const DatabaseService = {
    async init() {
        if (inited) return
        await client.query(`SET TIME ZONE 'UTC'`)
        await client.query('CREATE TABLE IF NOT EXISTS users (' +
            'id SERIAL PRIMARY KEY,' +
            'username VARCHAR(64) NOT NULL,' + 
            'password VARCHAR(128) NOT NULL,' +
            'email VARCHAR(128) NOT NULL,' +
            'UNIQUE (username)' +
        ')')
        await client.query('CREATE TABLE IF NOT EXISTS rooms (' +
            'id SERIAL,' +
            'room_id VARCHAR(32) NOT NULL PRIMARY KEY,' +
            'room_name VARCHAR(64) NOT NULL,' +
            'organizer VARCHAR(64) NOT NULL,' + 
            'deadline TIMESTAMP NOT NULL,' +
            'budget INTEGER NOT NULL' +
        ')')
        await client.query('CREATE SCHEMA IF NOT EXISTS room')
        inited = true
    },
    async getUser(username) {
        try {
            let q =  await query(USER_TABLE, USER_TABLE_FIELDS, `username = '${username}'`)
            if (!q.rows.length) {
                return null
            }
            return q.rows[0]
        } catch (e) {
            console.log(e)
            return null
        }
    },
    async checkUsernameValid(username) {
        let field = ['username']
        // username is valid if query rows is 0
        try {
            let q = await query(USER_TABLE, field, `username = '${username}'`)
            return !q.rows.length
        } catch (e) {
            console.log(e)
            return null
        }
    },
    async insertUser(data) {
        let values = []
        values.push(data.username)
        values.push(data.password)
        values.push(data.email)
        await insert(USER_TABLE, USER_TABLE_FIELDS, values)
    },
    async createRoom(data) {
        let values = []
        values.push(data.roomId)
        values.push(data.roomName)
        values.push(data.organizer)
        values.push(data.deadline)
        values.push(data.budget)
        try {
            // store the room metadata
            await insert(ROOMS_TABLE, ROOMS_TABLE_FIELDS, values)
            // create the room in room schema and join the room
            await createRoomTable(data.roomId)
            let roomInfoQuery = await this.joinRoom(data.roomId, data.organizer, data.email)
            let roomInfo = roomInfoQuery.rows[0]
            // automatically convert to the javascript timezone?
            let date = new Date(roomInfo.timezone)
            let self = this
            scheduleJob(date, async function () {
                let users = await self.getAllUsersInRoom(roomInfo.room_id, roomInfo.organizer)
                if (users.length) {
                    await Mailer.sendMail(users, roomInfo)
                }
            })
            return roomInfo
        } catch (e) {
            console.log(e) 
            return null
        }
    },
    async checkRoomExists(roomId) {
        let command = `SELECT EXISTS (SELECT * FROM information_schema.tables WHERE table_schema='room' AND table_name='room${roomId}')`
        try {
            let q = await client.query(command)
            return q.rows[0].exists
        } catch (e) {
            return false
        }
    },
    async joinRoom(roomId, username, email) {
        let exists = checkIfUserExistsInRoom(username, roomId)
        if (!exists.rows) {
            await insert(getRoomTable(roomId), ROOM_TABLE_FIELDS, [username, email])
        }
        return await query(ROOMS_TABLE, ROOMS_TABLE_QUERY_FIELDS, `room_id='${roomId}'`)
    },
    async getRoomInfo(roomId, username) {
        let valid = await checkIfUserExistsInRoom(username, roomId)
        if (valid) {
            return await query(ROOMS_TABLE, ROOMS_TABLE_QUERY_FIELDS, `room_id='${roomId}'`)
        }
        return null
    },
    async getAllUsersInRoom(roomId, username) {
        let valid = await checkIfUserExistsInRoom(username, roomId)
        if (valid) {
            let q = await query(getRoomTable(roomId), ROOM_TABLE_FIELDS)
            return q.rows
        }
        return null
    }
}

module.exports = DatabaseService
