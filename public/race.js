window.onload = () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        location.replace('/');
    } else {

        const socket = io.connect('http://localhost:3000');
        const textField = document.querySelector('#race-player-answer');
        const textRace = document.querySelector(".text-race");
        const playersList = document.querySelector(".users-race-list");




        socket.emit('jwtPush', {token: jwt});

        socket.on('newPlayer', payload => {

            const newLi = document.createElement('li');
            const newPlayerName = document.createElement("span");
            const newProgressBar = document.createElement('progress');

            newPlayerName.innerText = payload.name;
            newPlayerName.className = "user-race-name";
            newLi.className = "user-race-item";
            newProgressBar.id = payload.id;
            newProgressBar.setAttribute("max", "100");
            newLi.append(newPlayerName, newProgressBar);

            playersList.appendChild(newLi);
        });

        socket.on("textRace", payload => {
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

        })



        // submitBtn.addEventListener('click', ev => {
        //     socket.emit('submitMessage', { message: textField.value, token: jwt });
        // });
        //
        // socket.on('newMessage', payload => {
        //     const newLi = document.createElement('li');
        //     newLi.innerHTML = `${payload.message} - ${payload.user}`;
        //     messageListElem.appendChild(newLi);
        // });


    }

};
