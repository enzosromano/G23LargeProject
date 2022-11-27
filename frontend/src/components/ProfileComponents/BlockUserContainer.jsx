import React, { useState } from 'react';
import { MdOutlineManageSearch } from 'react-icons/md';

function BlockUserContainer() {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var blockUser;

    const [message, setMessage] = useState("");

    const blockUserSubmit = async event => {
        event.preventDefault();
        //First find the friend to delete
        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/search/' + blockUser.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

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


        var obj = { blockUser: blockUser.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/block/' + res1.results[0]._id), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

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

  return (
    <div className="block-user-container">
          <form onSubmit={blockUserSubmit}>
              <input type="text" id="userToBlock" placeholder="Block User" ref={(c) => blockUser = c} /><br />
              <MdOutlineManageSearch size="24" className="my-auto" class="button" onClick={blockUserSubmit} />
          </form>
          <span id="blockUserResult">{message}</span>
      </div>
  )
}

export default BlockUserContainer