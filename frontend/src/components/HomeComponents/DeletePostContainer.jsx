import React, { useState } from 'react';

function DeletePostContainer() {

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


    const deletePostSubmit = async event => {
        event.preventDefault();
    
        //Get all user post
        //Need to find postID

        try {
            const response = await fetch(buildPath('posts/${postID}'), { method: 'DELETE', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

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

    }
    
    return (
        <div className="delete-post-container">
        <form onSubmit={deletePostSubmit}>
            <input type="submit" id="deleteButton" class="buttons" value="Delete Current Post" onClick={deletePostSubmit} />
        </form>
        <span id="deletePostResult">{message}</span>
    </div>
  );
};


export default DeletePostContainer