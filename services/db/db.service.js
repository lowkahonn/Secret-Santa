const { Client } = require('pg')
const { scheduleJob } = require('node-schedule')
const Mailer = require('../email/mailer.service')
require('dotenv').config()

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
client.connect()

let inited = false
const USER_TABLE = 'users'
const ROOMS_TABLE = 'rooms'
const USER_TABLE_FIELDS = ['username', 'password', 'email', 'avatar', 'rooms']
const ROOM_TABLE_FIELDS = ['username', 'email', 'avatar']
const ROOMS_TABLE_FIELDS = ['room_id', 'room_name', 'organizer', 'deadline', 'budget', 'background']
const ROOMS_TABLE_QUERY_FIELDS = ['room_id', 'room_name', 'organizer', `deadline::timestamp at time zone 'UTC'`, 'budget', 'background']

async function query(table, fields, condition = null) {
    console.log(`[DatabaseService] Querying ${fields} from table ${table} with condition ${condition}`)
    fields = fields.join(',')
    if (condition != null) {
        return await client.query(`SELECT ${fields} FROM ${table} WHERE ${condition}`)
    }
    return await client.query(`SELECT ${fields} FROM ${table}`)
}

async function insert(table, fields, values) {
    console.log(`[DatabaseService] Insert into ${fields} in table ${table} with ${values}`)
    fields = fields.join(',')
    values = values.map(v => `'${v}'`).join(',')
    return await client.query(`INSERT INTO ${table} (${fields}) VALUES(${values})`)
}

async function update(table, columnValuePairs, condition = null) {
    console.log(`[DatabaseService] Update table ${table} with ${columnValuePairs} with condition ${condition}`)
    columnValuePairs = columnValuePairs.join(',')
    if (condition != null) {
        return await client.query(`UPDATE ${table} SET ${columnValuePairs} WHERE ${condition}`)
    }
    return await client.query(`UPDATE ${table} SET ${columnValuePairs}`)
}

async function createRoomTable(roomId) {
    return await client.query(`CREATE TABLE room.room${roomId} (` +
        'id SERIAL PRIMARY KEY,' +
        'username VARCHAR(64) NOT NULL,' +
        'email VARCHAR(128) NOT NULL,' +
        'avatar VARCHAR(32) NOT NULL,' +
        'santa VARCHAR(64),' +
        'FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE' +
    ')')
}

async function checkIfUserExistsInRoom(username, roomId) {
    return await client.query(`SELECT username FROM room.room${roomId} WHERE username='${username}'`)
}

function getRoomTable(roomId) {
    return `room.room${roomId}`
}

async function queryRoomInfo(roomId) {
    let q = await query(ROOMS_TABLE, ROOMS_TABLE_QUERY_FIELDS, `room_id='${roomId}'`)
    if (!q || !q.rows.length) {
        return null
    }
    let roomInfo = q.rows[0]
    roomInfo.roomId = roomInfo.room_id
    roomInfo.roomName = roomInfo.room_name
    roomInfo.deadline = roomInfo.timezone
    delete roomInfo.room_id
    delete roomInfo.room_name
    delete roomInfo.timezone
    return roomInfo
}

const DatabaseService = {
    async init() {
        if (inited) return
        console.log("[DatabaseService] init")
        await client.query(`SET TIME ZONE 'UTC'`)
        await client.query('CREATE TABLE IF NOT EXISTS users (' +
            'id SERIAL PRIMARY KEY,' +
            'username VARCHAR(64) NOT NULL,' + 
            'password VARCHAR(128) NOT NULL,' +
            'email VARCHAR(128) NOT NULL,' +
            'avatar VARCHAR(32) NOT NULL,' +
            'rooms text[],' +
            'UNIQUE (username)' +
        ')')
        await client.query('CREATE TABLE IF NOT EXISTS rooms (' +
            'id SERIAL,' +
            'room_id VARCHAR(32) NOT NULL PRIMARY KEY,' +
            'room_name VARCHAR(64) NOT NULL,' +
            'organizer VARCHAR(64) NOT NULL,' + 
            'deadline TIMESTAMP NOT NULL,' +
            'budget INTEGER NOT NULL,' +
            'background VARCHAR(32) NOT NULL' +
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
            let user = q.rows[0]
            if (user.rooms) {
                let rooms = []
                for (var i = 0; i < user.rooms.length; i++) {
                    let roomInfo = await queryRoomInfo(user.rooms[i])
                    if (roomInfo) {
                        rooms.push(roomInfo)
                    }
                }
                user.rooms = rooms
            }
            return user
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
        values.push(data.avatar)
        await insert(USER_TABLE, ['username', 'password', 'email', 'avatar'], values)
    },
    async createRoom(data) {
        let values = []
        values.push(data.roomId)
        values.push(data.roomName)
        values.push(data.organizer)
        values.push(data.deadline)
        values.push(data.budget)
        values.push(data.background)
        try {
            // store the room metadata
            await insert(ROOMS_TABLE, ROOMS_TABLE_FIELDS, values)
            // create the room in room schema and join the room
            await createRoomTable(data.roomId)
            let user = await this.getUser(data.organizer)
            let roomInfo = await this.joinRoom(data.roomId, data.organizer, data.email, user.avatar)
            // automatically convert to the javascript timezone?
            let date = new Date(roomInfo.deadline)
            let self = this
            console.log(`[DatabaseService] Scheduling job at ${date}`)
            scheduleJob(date, async function () {
                let users = await self.getAllUsersInRoom(roomInfo.roomId, roomInfo.organizer)
                if (users.length) {
                    let shuffledUsers = await Mailer.sendMail(users, roomInfo)
                    for (var i = 0; i < shuffledUsers.length; i++) {
                        let user = shuffledUsers[(i + 1) % shuffledUsers.length]
                        let santa = shuffledUsers[i]
                        await update(getRoomTable(roomInfo.roomId), [`santa = '${santa.username}'`], `username = '${user.username}'`)
                    }
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
    async joinRoom(roomId, username, email, avatar) {
        let exists = await checkIfUserExistsInRoom(username, roomId)
        if (!exists.rows || !exists.rows.length) {
            await insert(getRoomTable(roomId), ROOM_TABLE_FIELDS, [username, email, avatar])
            await update(USER_TABLE, [`rooms = rooms || '{${roomId}}'`], `username = '${username}'`)
        }
        return await queryRoomInfo(roomId)
    },
    async getRoomInfo(roomId, username) {
        let valid = await checkIfUserExistsInRoom(username, roomId)
        if (valid) {
            return await queryRoomInfo(roomId)
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
