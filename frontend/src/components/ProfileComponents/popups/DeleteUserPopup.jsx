import React, { useState } from 'react';

function DeleteUserPopup({active, close}) {
    
    const app_name = "tunetable23"
    
    function buildPath(route1, route2, route3) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route1 + route2 + route3;
        }
        else {
            return 'http://localhost:5000/' + route1 + route2 + route3;
        }
    }

    var email;
    var password;

    const [message, setMessage] = useState("");
    const [id, setID] = useState("")


    const deleteUserSubmit = async event => {
        event.preventDefault();

        var obj = { email: email.value, password: password.value };
        var js = JSON.stringify(obj);
        var userID = localStorage.getItem('userID')
        var token = localStorage.getItem('token')
        //var decodedData = JSON.parse(userID)
        //console.log(decodedData)
        console.log(token)

        try {
            const response = await fetch(buildPath('users/', userID, '/delete'), { method: 'DELETE', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                //var user = { userID: res.results["userID"], email: res.results["email"], password: res.results["password"] };
                //localStorage.setItem('user_data', JSON.stringify(user));
                console.log("Cannot delete user");

                setMessage(JSON.stringify(res.message));
                window.location.href = '/';
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
                
                <div className="mb-4 text-xl">are you sure you want to delete your account?</div>
                <form onSubmit={deleteUserSubmit} className="flex flex-col">
                    <label>Email</label>
                    <input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} className="text-gray-700 border-2 relative p-2 mb-4" />
                    <label>Password</label>
                    <input type="password" id="password" placeholder="Password" ref={(c) => password = c} className="text-gray-700 border-2 relative p-2 mb-4" />
                    <div className="flex justify-evenly">
                        <button onClick={close} className="w-5/12 p-1 border border-green-500 bg-green-200 hover:bg-green-400"> cancel </button>
                        <input type="submit" onClick={deleteUserSubmit} value="yes, delete my account" className="w-5/12 p-1 border border-red-500 bg-red-200 hover:bg-red-600 cursor-pointer"/>
                    </div>
                </form>
                <span id="deleteUserResult" className="my-2 text-brown-600">{message}</span>
                
            </div>
        </div>
    );

};

export default DeleteUserPopup;