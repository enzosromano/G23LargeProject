import React, { useState } from 'react';

function ViewFriendsPopup({active, close}) {
    
    const app_name = "tunetable23";
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var userToSearch;

    const [message, setMessage] = useState("");


    const searchUserSubmit = async event => {
        event.preventDefault();

        if("" === userToSearch.value || " " === userToSearch.value) {
            setMessage("Please provide a valid name");
            return;
        }

        

        try {
            const response = await fetch(buildPath('users/search/' + userToSearch.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                console.log(Object.keys(res))

                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    if (!active) return (null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 backdrop-blur-sm">
                
                <div className="flex flex-col w-full max-w-[400px] mx-auto bg-brown-400/90 p-4 rounded-lg font-semibold">
                    <div className="mb-4 text-xl text-brown-600">*simple list of friend names from API*</div>
                    <div className="mb-4 text-white">search user</div>
                    <form onSubmit={searchUserSubmit}>
                        <input type="text" id="username" placeholder="Search User" ref={(c) => userToSearch = c} className="text-gray-700 border-2 relative p-2 mb-4"/><br />
                        <input type="submit" onClick={searchUserSubmit} className="w-1/3 text-white p-1 border cursor-pointer" />
                    </form>
                    <span id="searchUserResult">{message}</span>
                    <button onClick={close} className="w-1/3 text-white p-1 my-1 border"> close </button>
                </div>
                
            
        </div>
    );
};

export default ViewFriendsPopup;