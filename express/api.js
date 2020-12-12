const express = require('express')
const history = require('connect-history-api-fallback')
const app = express();

// // Middleware for serving '/dist' directory
const staticFileMiddleware = express.static('../vue/dist');

// // 1st call for unredirected requests 
app.use(staticFileMiddleware);

app.use(history());
app.use(staticFileMiddleware);

app.get('/', (req, res) => res.send('../vue/dist/index.html'))
app.post('/register', (req, res) => res.send(req.body))

// // Support history api 
app.use(history()); 
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});