import React, { useState } from 'react';


// not sure if this will be used

function ResetPasswordPopup({active, close}) {

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
    var password

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
    
    if (!active) return (null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-brown-500 bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white p-4 font-semibold rounded-sm">
                
                <div className="mb-4 text-xl">Reset Password</div>
                {/* <form onSubmit={deleteUserSubmit} className="flex flex-col"> */}
                <form onSubmit={resetSubmit} className="flex flex-col">
                <label>Email</label>
                    <input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} className="text-gray-700 border-2 relative p-2 mb-4" />
                    <label>Password</label>
                    <input type="password" id="password" placeholder="Password" ref={(c) => password = c} className="text-gray-700 border-2 relative p-2 mb-4" />
                    <div className="flex justify-evenly">
                        <button onClick={close} className="w-1/3 p-1 border border-green-500 bg-green-200 hover:bg-green-400"> cancel </button>
                        {/*<input type="submit" onClick={resetSubmit} value="yes, reset my password" className="w-1/3 p-1 border border-red-500 bg-red-200 hover:bg-red-600 cursor-pointer"/>*/}
                        <input type="submit" onClick={resetSubmit} value="reset" className="w-1/3 p-1 border border-red-500 bg-red-200 hover:bg-red-600 cursor-pointer"/>
                    </div>
                </form>
                {/* <span id="resetPasswordResult" className="my-2 text-brown-600">{message}</span> */}
                
            </div>
        </div>
    );
    
    
};

export default ResetPasswordPopup;