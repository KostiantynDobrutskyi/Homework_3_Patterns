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

let clients = {};
let userMessage = "";
let counter = 10;
let counterRaceTime = 120;

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


io.sockets.on('connect', client => {

    if (!clients[client.id]) {
        clients[client.id] = {
            id: client.id,
            name: "usrs",
            progress: 0,
        }
    }

    waitingRace(clients);

    client.on("jwtPush", tokenJwt => {
        const {token} = tokenJwt;
        clients[client.id].name = jwt.decode(token).login;
        client.emit("newPlayer", clients);
        client.broadcast.emit("newPlayer", clients);
    });


    client.on('userAnswer', payload => {

        const {message, messageSvr} = payload;
        userMessage = message;
        let serverText = texts[0].text;
        if (serverText.indexOf(userMessage) === 0) {
            client.emit("renderTextProgress", {message, messageSvr: serverText.replace(message, '')});
            clients[client.id].progress = (userMessage.length / serverText.length) * 100;
            client.emit("newPlayer", clients);
            client.broadcast.emit("newPlayer", clients);
        }
    });


    client.on('disconnect', () => {
        delete clients[client.id];
    });
});


function waitingRace(clients) {
    if (Object.keys(clients).length === 1) {

        io.sockets.emit('waitingRace', "Очікується ще 1 гравець");

    } else if (Object.keys(clients).length >= 2) {
        let countdown = setInterval(() => {
            if (counter > 0) {
                io.sockets.emit('waitingRace', `Гонка розпочнеться через ${counter}`);
                counter--;
            }
            if (counter === 0) {
                io.sockets.emit('waitingRace', texts[0].text);
                startRace();
                clearInterval(countdown);
            }
            if (counter < 0) {
                clearInterval(countdown);

            }
        }, 1000);
    }
}

function startRace() {
    let countdown = setInterval(() => {
        if (counterRaceTime > 0) {
            let minute = Math.floor(counterRaceTime / 60);
            let second = counterRaceTime - minute * 60;
            io.sockets.emit('endRace', `until the end ${minute}m ${second}s`);
            counterRaceTime--;
        }
        if (counterRaceTime === 0) {
            io.sockets.emit('waitingRace', "Кінець заїзду");
            clearInterval(countdown);

        }

        if(counterRaceTime<0){
            counterRaceTime = 0;
        }
    }, 1000);
}







