import React, { useState } from 'react';
import { MdOutlineManageSearch } from 'react-icons/md';

function UnblockUserContainer() {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var unblockUser;

    const [message, setMessage] = useState("");

    const unblockUserSubmit = async event => {
        event.preventDefault();

        var userID = localStorage.getItem('userID');
        //First find the friend to delete
        try {
            const response = await fetch(buildPath('users/' + userID + '/search/' + unblockUser.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

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


        var obj = { unblockUser: unblockUser.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/unblock/' + res1.results[0]._id), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

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
    <div className="unblock-user-container">
          <form onSubmit={unblockUserSubmit}>
              <input type="text" id="userToUnblock" placeholder="Unblock User" ref={(c) => unblockUser = c} /><br />
              <MdOutlineManageSearch size="24" className="my-auto" class="button" onClick={unblockUserSubmit} />
          </form>
          <span id="blockUserResult">{message}</span>
      </div>
  )
}

export default UnblockUserContainer