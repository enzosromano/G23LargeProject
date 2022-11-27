import React, { useState } from 'react';

function DeleteFriendContainer() {

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

    return (
        <div className="delete-friend-container">
            <form onSubmit={deleteFriendSubmit}>
                <input type="text" id="deleteFriend" placeholder="Delete a Friend" ref={(c) => friendToDelete = c} /><br />
                <input type="submit" id="deleteFriendButton" class="buttons" value="Delete Friend" onClick={deleteFriendSubmit} />
            </form>
            <span id="deleteFriendResult">{message}</span>
        </div>
    );
};

export default DeleteFriendContainer;