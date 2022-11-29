import React, { useState } from 'react';

const ProvideEmailPage = () => {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var email
    

    const [message, setMessage] = useState("");

    const resetSubmit = async event => {
        event.preventDefault();

        var userID = localStorage.getItem('userID');
        //First find the friend to delete
        try {
            const response = await fetch(buildPath('users/' + userID + '/sendPasswordReset'), { method: 'POST', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
            
                setMessage(JSON.stringify(res.message));
                window.location.reload();
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return(
        <div className="relative w-full h-screen">
        
            <div className=" w-full h-full bg-login_bg bg-center">
            
                <div className="flex justify-center h-full items-center">
                    <form onSubmit={resetSubmit} className="w-full max-w-[400px] mx-auto bg-brown-400/90 p-8 rounded-lg flex flex-col">
                        <div className="text-brown-600 text-2xl font-bold text-center py-6">almost there!</div>
                        <div className="text-white font-semibold text-center mb-4">type an email to send a reset password link</div>
                    
                        <label className="text-brown-600 font-semibold">email to use</label>
                        <input type="text" id="email" ref={(c) => email = c} className="text-white relative bg-brown-500 p-2 focus:outline-none" />
                    
                        <input type="submit" onClick={resetSubmit} class="buttons" id="loginButton" value="submit" className="cursor-pointer w-full py-3 mt-8 shadow-2xl bg-brown-200 font-semibold text-white hover:bg-brown-600 hover:rounded-xl transition-all duration-100 ease-linear" />
                        <div onClick={() => window.location.href = "/"} className="text-center text-white py-1 hover:cursor-pointer">Go back to login</div>
                    
                    </form>
                    {/* <span>{message}</span> */}
                </div>
            </div>
        
        </div>  
        
    );
};

export default ProvideEmailPage;