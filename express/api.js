const db = require('./db/db.service')
const express = require('express')
const history = require('connect-history-api-fallback')
const registrationRouter = require('./routes/registration.router')
const loginRouter = require('./routes/login.router')
const app = express();
app.use(express.json());
// // Middleware for serving '/dist' directory
const staticFileMiddleware = express.static('../vue/dist');

// // 1st call for unredirected requests 
app.use(staticFileMiddleware);

app.use(history());
app.use(staticFileMiddleware);

app.get('/', (req, res) => res.send('../vue/dist/index.html'))
app.use('/register', registrationRouter)
app.use('/login', loginRouter)

// // Support history api 
app.use(history()); 
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});