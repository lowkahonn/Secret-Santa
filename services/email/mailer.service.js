const nodemailer = require('nodemailer')
const shuffle = require('../shuffle.service')
require('dotenv').config()

function getHtml(santa, user, roomInfo) {
    let html = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body>
        <div bgcolor="#ffffff" style="font-size: 16px; font-family: Arial, sans-serif; line-height: 24px; color: '#000000';">
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
        </div>
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
            try {
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
            } catch (e) {
                console.log(e)
                console.log(`couldn't send to ${santa.email}`)
                continue
            }
        }
        return users
    }
}

module.exports = Mailer
