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
            const response = await fetch(buildPath('users/search/' + friendToDelete.value), { method: 'GET', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                console.log(res.results[0])
                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

        var obj = { friendToDelete: friendToDelete.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/unfriend/' + res.results[0]._id), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                setMessage(JSON.stringify(res.message));
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