import React, { useState } from 'react';

function Login() {

    const app_name = "tunetable23"
    function buildPath(route) {

        if(process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return "http://localhost:5000/" + route;
        }
    }

    var email;
    var password;

    const [message, setMessage] = useState("");

    const handleSubmit = async event => {
        event.preventDefault();

        var obj = {email:email.value, password:password.value};
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath("users/auth"), 
            {method:'POST', body:js, headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());

            if( res.id <= 0 ) {
                setMessage('Email/Password combination incorrect');
            }
            else {
                var user = {firstName:res.firstName, lastName:res.lastName, id:res.id}
                localStorage.setItem('user_data', JSON.stringify(user));

                setMessage("");
                window.location.href = '../views/homePage';
            }
        }

        catch(e) {
            alert(e.toString());
            return;
        }
    };

    return(
        <div className="auth-form-container">
            <form onSubmit={handleSubmit}>
                <label htmlfor="email">email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ianfrelix@yahoo.com" id="email" name="email"
                ref={(c) => email = c} />
                <label htmlfor="password">password</label>
                <input value={pass} onChnage={(e) => setPass(e.target.value)} type="password" placeholder="*********" id="password" name="password"
                ref={(c) => password = c}/>
                <input type="submit" id="loginButton" class="buttons" value = "Do It" onClick={handleSubmit} />
            </form>
            <span id="loginResult">{message}</span>
        </div>
    );
};