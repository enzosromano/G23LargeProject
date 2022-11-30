import React, { useState } from 'react';

const ChangePasswordPage = () => {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var password

    const [message, setMessage] = useState("");
    var cookies = document.cookie.split(';').map(cookie => cookie.split('=')).reduce((accumulator, [key, value]) => ({accumulator, [key.trim()]: decodeURIComponent(value)}), {});
    console.log(cookies.userID)

    const resetSubmit = async event => {
        event.preventDefault();

        var obj = { password: password.value };
        var js = JSON.stringify(obj);

        
        
        
        try {
            const response = await fetch(buildPath('users/' + cookies.userID + '/password'), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
            
                setMessage('You can now use your new password!');
                
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
                        <div className="text-white font-semibold text-center mb-4">type new password</div>
                    
                        <label className="text-brown-600 font-semibold">new password</label>
                        <input type="password" id="password" ref={(c) => password = c} className="text-white relative bg-brown-500 p-2 focus:outline-none" />
                        <label className="text-brown-600 font-semibold">Confirm new password</label>
                        <input type="password" id="password" className="text-white relative bg-brown-500 p-2 focus:outline-none" />
                    
                        <input type="submit" class="buttons" id="loginButton" value="submit" onClick={resetSubmit} className="cursor-pointer w-full py-3 mt-8 shadow-2xl bg-brown-200 font-semibold text-white hover:bg-brown-600 hover:rounded-xl transition-all duration-100 ease-linear" />
                    
                    
                    </form>
                    {/* <span>{message}</span> */}
                </div>
            </div>
        
        </div>  
        
    );
};

export default ChangePasswordPage;