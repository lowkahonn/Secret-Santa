const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
    connectionString: process.env.DATABASE_URL
})
client.connect()

let inited = false
const USER_TABLE = 'users'
const ROOMS_TABLE = 'rooms'
const USER_TABLE_FIELDS = ['username', 'password', 'email']
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
        'FOREIGN KEY (username) REFERENCES users (username)' +
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
            return await this.joinRoom(data.roomId, data.organizer)
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
    async joinRoom(roomId, username) {
        let exists = checkIfUserExistsInRoom(username, roomId)
        if (!exists.rows) {
            await insert(getRoomTable(roomId), ['username'], [username])
        }
        return await query(ROOMS_TABLE, ROOMS_TABLE_QUERY_FIELDS, `room_id='${roomId}'`)
    },
    async getRoomInfo(roomId, username) {
        let valid = await checkIfUserExistsInRoom(username, roomId)
        if (valid) {
            return await query(ROOMS_TABLE, ROOMS_TABLE_QUERY_FIELDS, `room_id='${roomId}'`)
        }
        return null
    }
}

module.exports = DatabaseService
