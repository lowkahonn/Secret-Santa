const nodemailer = require('nodemailer')
const shuffle = require('../shuffle.service')
require('dotenv').config()

class Mailer {
    static async sendMail(users, roomInfo) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        users = shuffle(users)
        let subject = `It is time to reveal your secret santa at room ${roomInfo.room_name}`
        for (var i = 0; i < users.length; i++) {
            let user = users[(i + 1) % users.length]
            let santa = users[i]
            let options = {
                from: process.env.EMAIL_USER,
                to: santa.email,
                subject,
                html: `
                    <h1>Secret Santa</h1>
                    <br>
                    <p>Hohoho ${santa.username}!</p>
                    <p>You will have to be the Secret Santa of <strong>${user.username}</strong>! You will have a budget of ${roomInfo.budget} to buy the most attractive present to ${user.username}!</p>
                    <p>Enjoy! :)</p>
                `
            }
            await transporter.sendMail(options)
            console.log(`sent to ${santa.email}`)
        }
        return users
    }
}

module.exports = Mailer
