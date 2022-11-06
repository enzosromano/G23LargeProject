import React, { useState } from 'react';

function Login() {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV !== "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var email;
    var password;

    const [message, setMessage] = useState("");

    const handleSubmit = async event => {
        event.preventDefault();

        var obj = { email: email.value, password: password.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/auth'), { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                var user = { userID: res.results["userID"], email: res.results["email"], password: res.results["password"] };
                localStorage.setItem('user_data', JSON.stringify(user));

                setMessage(JSON.stringify(res.message));
                window.location.href = '/home';
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }
    };

    return (
        <div id="loginDiv">
            <form onSubmit={handleSubmit}>
                <span id="inner-title">PLEASE LOG IN</span><br />
                <input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} /><br />
                <input type="password" id="loginPassword" placeholder="Password" ref={(c) => password = c} /><br />
                <input type="submit" id="loginButton" class="buttons" value = "Log In" onClick={handleSubmit} />
            </form>
            <span id="loginResult">{message}</span>
            <button onClick={() => window.location.href = "/register"}>Don't have an Account? Register Here!</button>
        </div>
    );
};

export default Login;