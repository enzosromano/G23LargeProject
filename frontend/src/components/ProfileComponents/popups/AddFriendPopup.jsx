import React, { useState } from 'react';

function AddFriendPopup({active, close}) {
    
    
    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var friendToAdd;

    const [message, setMessage] = useState("");


    const addFriendSubmit = async event => {
        event.preventDefault();

        if("" === friendToAdd.value || " " === friendToAdd.value) {
            setMessage("Please provide a valid user to add")
            return
        }
        
        var userID = localStorage.getItem('userID')
        var obj = { friendToAdd: friendToAdd.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/' + userID + '/search/' + friendToAdd.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            var res1 = JSON.parse(await response.text());

            if (!res1.success) {
                setMessage(JSON.stringify(res1));
            }
            else {
                console.log(res1)
                localStorage.setItem('friendID', res1.results[0]._id)
                console.log("good")
                setMessage(JSON.stringify(res1.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }


        try {

            const response = await fetch(buildPath('users/' + userID + '/addFriend/' + localStorage.getItem('friendID')), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

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

    }
    
    if (!active) return (null);
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 backdrop-blur-sm">
                
                <form onSubmit={addFriendSubmit} className="flex flex-col w-full max-w-[300px] mx-auto bg-brown-400/90 p-4 rounded-lg font-semibold">
                    <div className="mb-4 text-xl text-brown-600">add friend by username</div>
                    <label className="text-white">username</label>
                    <input type="text" id="userToAdd" placeholder="Add a friend" ref={(c) => friendToAdd = c} className="text-gray-700 border-2 relative p-2 mb-4" />
                    <div className="flex justify-evenly">
                        <button onClick={close} className="w-1/3 text-white p-1 border"> cancel </button>
                        <input type="submit" value="submit" onClick={addFriendSubmit} className="w-1/3 text-white p-1 border cursor-pointer"/>
                    </div>
                    <span id="addFriendResult" className="my-2 text-brown-600">{message}</span>
                </form>
                
            
        </div>
    );
};

export default AddFriendPopup;