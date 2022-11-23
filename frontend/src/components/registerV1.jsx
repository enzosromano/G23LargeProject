import React, { useState } from 'react';
import register_bg from "../images/register_bg.jpg"

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
    var username;
    

    const [message, setMessage] = useState('');

    const handleSubmit = async event => {
        event.preventDefault();

        var obj = {firstName:firstName.value, lastName:lastName.value, email:email.value, username:username.value, password:password.value};
        var js = JSON.stringify(obj);

        try {
            
            const response = await fetch(buildPath('users'), {method:'POST', body:js, headers:{'Content-Type':'application/json'}});

            var res = JSON.parse(await response.text());

            if(!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                // var user = {userID:res.results["userID"], email:res.results["email"], password:res.results["password"]};
                // localStorage.setItem('user_data', JSON.stringify(user));

                setMessage("Successfully added user.");
                window.location.href = '/';
            }
        }

        catch(e) {
            alert(e.toString());
            return;
        }
    };

    return (
        //<div id="registerDiv">
            //<form onSubmit={handleSubmit}>
                //<span id="inner-title">PLEASE Register</span><br />
                //<input type="text" id="firstName" placeholder="John" ref={(c) => firstName = c} /><br />
                //<input type="text" id="lastName" placeholder="Bui" ref={(c) => lastName = c} /><br />
                //<input type="text" id="username" placeholder="JohnBui123" ref={(c) => username = c} /><br />
                //<input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} /><br />
                //<input type="password" id="password" placeholder="**********" ref={(c) => password = c} /><br />
                //<input type="submit" id="registerButton" class="buttons" value = "Register" onClick={handleSubmit} />
            //</form>
            //<span id="registerResult">{message}</span>
        //</div>


        <div className="register-container flex relative w-full h-screen">
            
                <div className="w-full h-full bg-login_bg bg-center">
                
                    <div className="flex flex-row justify-center h-full items-center">
                        <div className="max-w-[450px] ml-auto">
                            <img src={register_bg} className="rounded-lg" alt="people huddled around record player" />
                        </div>
                        <form className="w-full max-w-[450px] min-h-[450px] mr-auto bg-brown-400/90 py-0 px-8 rounded-lg flex flex-col">
                            <div className="text-brown-600 text-2xl font-bold text-center pt-3">tunetable.</div>
                            <div className="text-white font-semibold text-center">register new account</div>
                        
                            <label className="text-brown-600 font-semibold">first name</label>
                            <input type="text" id="firstName" placeholder="John" ref={(c) => firstName = c} className="text-field" />
                        
                            <label className="text-brown-600 font-semibold">last name</label>
                            <input type="text" id="lastName" placeholder="Bui" ref={(c) => lastName = c} className="text-field" />
                        
                            <label className="text-brown-600 font-semibold">username</label>
                            <input type="text" id="userName" placeholder="XxIanxX" ref={(c) => username = c} className="text-field" />
                        
                            <label className="text-brown-600 font-semibold">email</label>
                            <input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} className="text-field" />
                        
                            <label className="text-brown-600 font-semibold">password</label>
                            <input type="password" id="password" placeholder="**********" ref={(c) => password = c} className="text-field" />
                        
                            <input type="submit" id="registerButton" class="buttons" value = "Register" onClick={handleSubmit} className="cursor-pointer w-full py-2 mt-8 shadow-2xl bg-brown-200 font-semibold text-white hover:bg-brown-600 hover:rounded-xl transition-all duration-100 ease-linear" />
                        
                            <div onClick={() => window.location.href = "/"} className="text-center text-white py-1 hover:cursor-pointer">already have an account?</div>
                        
                        </form>
                        <span id="registerResult">{message}</span>
                    
                    </div>
                </div>
            
            </div>
    );
};

export default Register;