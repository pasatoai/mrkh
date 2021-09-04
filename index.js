const express = require('express');
const {PL} = require('./text');

const app = express();

app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.render('index', {
        BROWSER_REFRESH: process.env.BROWSER_REFRESH_URL,
        text: PL
    });
});

app.listen(9000, () => {
    console.log('listening')
    if (process.send) {
        process.send({event: 'online', url: 'http://localhost:9000/'})
    }
});