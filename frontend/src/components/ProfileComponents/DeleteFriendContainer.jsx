import React, { useState } from 'react';
import { TiDelete } from 'react-icons/ti';

function DeleteFriendContainer({postID}) {
    console.log(postID)

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    const [message, setMessage] = useState("");

    const deleteFriendSubmit = async event => {
        event.preventDefault();
        

        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/unfriend/' + postID), { method: 'POST', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res2 = JSON.parse(await response.text());

            if (!res2.success) {
                setMessage(JSON.stringify(res2));
            }
            else {
                setMessage(JSON.stringify(res2.message));
                window.location.reload();
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
                <TiDelete size="24" className="my-auto" class="button" onClick={deleteFriendSubmit} />
            </form>
            <span id="deleteFriendResult">{message}</span>
        </div>
    );
};

export default DeleteFriendContainer;