const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
    connectionString: process.env.DATABASE_URL
})
client.connect()

let inited = false
const USER_TABLE = 'users'
const USER_TABLE_FIELDS = ['username', 'password', 'email']

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

const DatabaseService = {
    async init() {
        if (inited) return
        inited = true
        return client.query('CREATE TABLE IF NOT EXISTS users (' +
            'id SERIAL PRIMARY KEY,' +
            'username VARCHAR(64) NOT NULL,' + 
            'password VARCHAR(128) NOT NULL,' +
            'email VARCHAR(128) NOT NULL' +
        ')', (err, _) => {
            if (err) throw err;
        })
    },
    async getUser(username) {
        let q =  await query(USER_TABLE, USER_TABLE_FIELDS, `username = '${username}'`)
        if (!q.rows.length) {
            return null
        }
        return q.rows[0]
    },
    async checkUsernameValid(username) {
        let field = ['username']
        // username is valid if query rows is 0
        let q = await query(USER_TABLE, field, `username = '${username}'`)
        return !q.rows.length
    },
    async insertUser(data) {
        let values = []
        values.push(data.username)
        values.push(data.password)
        values.push(data.email)
        return await insert(USER_TABLE, USER_TABLE_FIELDS, values)
    }
}

module.exports = DatabaseService
