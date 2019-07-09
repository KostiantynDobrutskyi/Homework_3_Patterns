const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bodyParser = require('body-parser');
const users = require('./users.json');
const texts = require('./text.json');

let clients = [];
let userMessage = "";

require('./passport.config');

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/race', /*passport.authenticate('jwt'),*/ function (req, res) {
    res.sendFile(path.join(__dirname, 'race.html'));
});

app.post('/', function (req, res) {
    const userFromReq = req.body;
    const userInDB = users.find(user => user.login === userFromReq.login);
    if (userInDB && userInDB.password === userFromReq.password) {
        const token = jwt.sign(userFromReq, 'someSecret', {expiresIn: '24h'});
        res.status(200).json({auth: true, token});
    } else {
        res.status(401).json({auth: false});
    }
});


io.sockets.on('connect', function (client) {
    if (clients.indexOf(client.id)) {
        clients.push(client.id)
    }
    console.log("clients:", clients);
    console.log("length:", clients.length);
    client.on("jwtPush", tokenJwt => {
        const {token} = tokenJwt;
        const userLogin = jwt.decode(token).login;
        console.log(userLogin);
        client.broadcast.emit("newPlayer", userLogin);
        client.emit("newPlayer", {name: userLogin, id: client.id});
    });


    client.on('disconnect', function () {
        clients.splice(clients.indexOf(client.id), 1);
        console.log("client disconnect:", client.id);
        console.log("client disconnect length:", clients.length);
    });
});


io.on('connection', socket => {
    socket.on('userAnswer', payload => {

        const {message, messageSvr} = payload;
        userMessage = message;
        if (texts[0].text.indexOf(userMessage) === 0) {
            socket.emit("renderTextProgress", {message, messageSvr: texts[0].text.replace(message, '')});
            console.log("true");
        } else {
            console.log("false")
        }
    });

    socket.emit("textRace", texts[0].text)
});


// io.on('connection', socket => {
//     socket.on('submitMessage', payload => {
//         const { message, token } = payload;
//         const userLogin = jwt.decode(token).login;
//         socket.broadcast.emit('newMessage', { message, user: userLogin });
//         socket.emit('newMessage', { message, user: userLogin });
//     });
// });



