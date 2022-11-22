import React, { useState } from 'react';


function Login() {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV == "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var username;
    var password;

    const [message, setMessage] = useState("");

    const handleSubmit = async event => {
        event.preventDefault();

        var obj = { username: username.value, password: password.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/auth'), { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                var user = { userID: res.results["_id"], email: res.results["email"] };
                localStorage.setItem('userID', JSON.stringify(user.userID));
                localStorage.setItem('email', JSON.stringify(user.email));
                console.log(JSON.stringify(user.userID));

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
        //<div className="login-container">
            //<form onSubmit={handleSubmit}>
                //<span id="inner-title">PLEASE LOG IN!</span><br />
                //<input type="text" id="username" placeholder="Username" ref={(c) => username = c} /><br />
                //<input type="password" id="loginPassword" placeholder="Password" ref={(c) => password = c} /><br />
                //<input type="submit" id="loginButton" class="buttons" value="Log In" onClick={handleSubmit} />
            //</form>
            //<span id="loginResult">{message}</span>
        //</div>


        <div className="login-container relative w-full h-screen">
        
            <div className=" w-full h-full bg-login_bg bg-center">
            
                <div className="flex justify-center h-full items-center">
                    <form onSubmit={handleSubmit} className="w-full max-w-[450px] mx-auto bg-brown-400/90 p-8 rounded-lg flex flex-col">
                        <div className="text-brown-600 text-2xl font-bold text-center py-6">tunetable.</div>
                        <div className="text-white font-semibold text-center">discover new music with your friends, with a side of friendly competition</div>
                    
                        <label className="text-brown-600 font-semibold">username</label>
                        <input type="text" id="username" ref={(c) => username = c} className="text-white relative bg-brown-500 p-2 mb-4 focus:outline-none" />
                        <label className="text-brown-600 font-semibold">password</label>
                        <input type="password" id="password" ref={(c) => password = c} className="text-white relative bg-brown-500 p-2 focus:outline-none" />
                    
                        <input type="submit" class="buttons" id="loginButton" value="Sign In" onClick={handleSubmit} className="cursor-pointer w-full py-3 mt-8 shadow-2xl bg-brown-200 font-semibold text-white hover:bg-brown-600 hover:rounded-xl transition-all duration-100 ease-linear" />
                    
                        <div className="text-white underline mt-1 hover:cursor-pointer">forgot your password?</div>
                        <div onClick={() => window.location.href = "/register"} className="text-center text-white mt-2 hover:cursor-pointer">create new account</div>
                    
                    </form>
                    <span id="loginResult">{message}</span>
                </div>
            </div>
        
        </div>
    );
};

export default Login;