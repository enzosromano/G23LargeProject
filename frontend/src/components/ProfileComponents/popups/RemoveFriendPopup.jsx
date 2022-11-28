import React, { useState } from 'react';

function RemoveFriendPopup({active, close}) {
    
    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var friendToDelete;

    const [message, setMessage] = useState("");

    const deleteFriendSubmit = async event => {
        event.preventDefault();
        //First find the friend to delete
        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/search/' + friendToDelete.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            var res1 = JSON.parse(await response.text());

            if (!res1.success) {
                setMessage(JSON.stringify(res1));
            }
            else {
                
                setMessage(JSON.stringify(res1.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

        var obj = { friendToDelete: friendToDelete.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/unfriend/' + res1.results[0]._id), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res2 = JSON.parse(await response.text());

            if (!res2.success) {
                setMessage(JSON.stringify(res2));
            }
            else {
                setMessage(JSON.stringify(res2.message));
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }
    };
    
    if (!active) return (null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 backdrop-blur-sm">
                
                <form onSubmit={deleteFriendSubmit} className="flex flex-col w-full max-w-[300px] mx-auto bg-brown-400/90 p-4 rounded-lg font-semibold">
                    <div className="mb-4 text-xl text-brown-600">remove friend by username</div>
                    <label className="text-white">username</label>
                    <input type="text" id="deleteFriend" placeholder="Remove Friend" ref={(c) => friendToDelete = c} className="text-gray-700 border-2 relative p-2 mb-4" />
                    <div className="flex justify-evenly">
                        <button onClick={close} className="w-1/3 text-white p-1 border"> cancel </button>
                        <input type="submit" value="submit" onClick={deleteFriendSubmit} className="w-1/3 text-white p-1 border cursor-pointer"/>
                    </div>
                    <span id="deleteFriendResult">{message}</span>
                </form>
                
            
        </div>
    );
};

export default RemoveFriendPopup;