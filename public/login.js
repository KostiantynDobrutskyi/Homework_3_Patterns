window.onload = () => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
        location.replace('/race');
    }

    const formSubmit = document.querySelector(".auth-form");
    const loginField = document.querySelector('#auth-login');
    const pswdField = document.querySelector('#auth-pswd');

    formSubmit.addEventListener('submit', ev => {
        ev.preventDefault();
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginField.value,
                password: pswdField.value
            })
        }).then(res => {
            res.json().then(body => {
                console.log(body);
                if (body.auth) {
                    localStorage.setItem('jwt', body.token);
                    location.replace('/race');
                } else {
                    console.log('auth failed');
                }
            })
        }).catch(err => {
            console.log('request went wrong');
        })
    });

};
