import React, { useState } from 'react';

function Register() {


    const app_name = "tunetable23"
    function buildPath(route) {

        if(process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return "http://localhost:5000/" + route;
        }
    }

    var firstName;
    var lastName;
    var email;
    var password;
    

    const [message, setMessage] = useState('');

    const handleSubmit = async event => {
        event.preventDefault();

        var obj = {firstName:firstName.value, lastName:lastName.value, email:email.value, password:password.value};
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/'), {method:'POST', body:js, headers:{'Content-Type':'application/json'}});

            var res = JSON.parse(await response.text());

            if( res.id <= 0 ) {
                setMessage('Registration failed');
            }
            else {
                var user = {firstName:res.firstName, lastName:res.lastName, id:res.id}
                localStorage.setItem('user_data', JSON.stringify(user));

                setMessage('');
                window.location.href = '../views/loginPage';
            }
        }

        catch(e) {
            alert(e.toString());
            return;
        }
    };

    return (
        <div id="registerDiv">
            <form onSubmit={handleSubmit}>
                <span id="inner-title">PLEASE Register</span><br />
                <input type="text" id="firstName" placeholder="John" ref={(c) => firstName = c} /><br />
                <input type="text" id="lastName" placeholder="Bui" ref={(c) => lastName = c} /><br />
                <input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} /><br />
                <input type="password" id="password" placeholder="**********" ref={(c) => password = c} /><br />
                <input type="submit" id="registerButton" class="buttons" value = "Register" onClick={handleSubmit} />
            </form>
            <span id="registerResult">{message}</span>
        </div>
    );
};

export default Register;