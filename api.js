const express = require('express')
const history = require('connect-history-api-fallback')
const registrationRouter = require('./routes/registration.router')
const loginRouter = require('./routes/login.router')
const roomRouter = require('./routes/room.router')
require('dotenv').config()
const app = express();
app.use(express.json());
// // Middleware for serving '/dist' directory
const staticFileMiddleware = express.static('./vue/dist');

// // 1st call for unredirected requests 
app.use(staticFileMiddleware);

app.use(history());
app.use(staticFileMiddleware);

app.get('/', (req, res) => res.send('./vue/dist/index.html'))
app.use('/register', registrationRouter)
app.use('/login', loginRouter)
app.use('/room', roomRouter)

// // Support history api 
app.use(history()); 
let port = process.env.PORT || 3000
app.listen(port, function () {
    console.log(`Secret Santa app listening on port ${port}!`);
});
