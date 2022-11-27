import React, { useState } from 'react';
import { MdOutlineManageSearch } from 'react-icons/md';

function AddFriendContainer() {

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
    
    return (
      <div className="add-friend-container">
          <form onSubmit={addFriendSubmit}>
              <input type="text" id="userToAdd" placeholder="Add a friend" ref={(c) => friendToAdd = c} /><br />
              <MdOutlineManageSearch size="24" className="my-auto" class="button" onClick={addFriendSubmit} />
          </form>
          <span id="addFriendResult">{message}</span>
      </div>
  );
};


export default AddFriendContainer;