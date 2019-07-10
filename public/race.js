window.onload = () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        location.replace('/');
    } else {

        const socket = io.connect('http://localhost:3000');
        const textField = document.querySelector('#race-player-answer');
        const textRace = document.querySelector(".text-race");
        const playersList = document.querySelector(".users-race-list");
        const timerEnd = document.querySelector(".timer-end-race");
        const botMessage = document.querySelector(".bot-message-info");


        socket.emit('jwtPush', {token: jwt});

        socket.on('newPlayer', payload => {
            playersList.innerHTML = "";
            for (let key in payload) {
                const newLi = document.createElement('li');
                const newPlayerName = document.createElement("span");
                const newProgressBar = document.createElement('progress');

                newPlayerName.innerText = payload[key].name;
                newPlayerName.className = "user-race-name";

                newProgressBar.id = payload[key].id;
                newProgressBar.setAttribute("max", "100");
                newProgressBar.setAttribute("value", payload[key].progress);

                newLi.className = "user-race-item";
                newLi.append(newPlayerName, newProgressBar);
                playersList.appendChild(newLi);
            }
        });

        socket.on("waitingRace", payload => {
            textRace.innerHTML = payload;
        });

        socket.on("renderTextProgress", payload => {
            textRace.innerHTML = "";
            const newSpanUsr = document.createElement("span");
            const newSpanServ = document.createElement("span");
            newSpanUsr.className = "text-race-progress";
            newSpanUsr.innerText = payload.message;

            newSpanServ.className = "text-race-serv";
            newSpanServ.innerText = payload.messageSvr;
            textRace.append(newSpanUsr, newSpanServ)

        });


        textField.addEventListener('input', ev => {
            socket.emit("userAnswer", {message: textField.value})

        });

        socket.on("endRace", counter => {
            timerEnd.innerHTML = counter;
        })

        socket.on("botMessage", message => {
            botMessage.innerHTML = message;
        })



    }

};
