const nodemailer = require('nodemailer')
const shuffle = require('../shuffle.service')
require('dotenv').config()

function getHtml(santa, user, roomInfo) {
    let html = `
    <html>
    <body>
    <img src="cid:emailheader"/>
    <h1>You will be the Secret Santa 🎅🏻 of ...</h1>
    <h3>🎄 Merry Christmas ${santa.username}!</h3>
    <p>Exciting time! Starting from now to the Christmas Day, you will be the Secret Santa of <strong>${user.username}</strong>! You will have a budget of ${roomInfo.budget} to buy a secret gift for ${user.username}. `
    if (user.wish) {
        html += `
            To make your life easier (or harder), we leaked ${user.username}'s wish that you could refer to 😛</p>
            <p>${user.username}'s wish: ${user.wish}</p>
        `
    } else {
        html += '</p>'
    }
    html += `
        <p>Enjoy the game! :)</p>
        <br>
        <div>Cheers,</div>
        <div>Secret Agents</div>
        </body>
        </html>
    `
    return html
}
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
        let subject = `We've drawn a name for you!`
        for (var i = 0; i < users.length; i++) {
            let user = users[(i + 1) % users.length]
            let santa = users[i]
            let html = getHtml(santa, user, roomInfo)
            let options = {
                from: process.env.EMAIL_USER,
                to: santa.email,
                subject,
                html,
                attachments: [{
                    filename: 'emailheader.png',
                    path: __dirname + '/emailheader.png',
                    cid: 'emailheader'
                }]
            }
            await transporter.sendMail(options)
            console.log(`sent to ${santa.email}`)
        }
        return users
    }
}

module.exports = Mailer
