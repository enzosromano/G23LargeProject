import React, { useState } from 'react';
import { MdThumbDownOffAlt } from 'react-icons/md';

function UnlikePostContainer() {

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


    const unlikePostSubmit = async event => {
        event.preventDefault();


        try {
            //Needs postId and userId
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/like/:postId'), { method: 'POST', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

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
        <div className="unlike-post-container">
        <form onSubmit={unlikePostSubmit}>
            <MdThumbDownOffAlt size="24" className="my-auto" class="button" onClick={unlikePostSubmit} />
        </form>
        <span id="unlikePostResult">{message}</span>
    </div>
  );
};


export default UnlikePostContainer