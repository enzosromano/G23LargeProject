import React, { useState } from 'react';

function DeleteUserButton() {

    const app_name = "tunetable23"
    
    function buildPath(route1, route2, route3) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route1 + route2 + route3;
        }
        else {
            return 'http://localhost:5000/' + route1 + route2 + route3;
        }
    }

    var email;
    var password;

    const [message, setMessage] = useState("");
    const [id, setID] = useState("")


    const deleteUserSubmit = async event => {
        event.preventDefault();

        var obj = { email: email.value, password: password.value };
        var js = JSON.stringify(obj);
        var userID = localStorage.getItem('userID')
        var token = localStorage.getItem('token')
        //var decodedData = JSON.parse(userID)
        //console.log(decodedData)
        console.log(token)

        try {
            const response = await fetch(buildPath('users/', userID, '/delete'), { method: 'DELETE', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                //var user = { userID: res.results["userID"], email: res.results["email"], password: res.results["password"] };
                //localStorage.setItem('user_data', JSON.stringify(user));
                console.log("Cannot delete user");

                setMessage(JSON.stringify(res.message));
                window.location.href = '/';
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return (
      <div className="deleteUser-container">
          <form onSubmit={deleteUserSubmit}>
              <input type="text" id="email" placeholder="ianfrelix@yahoo.com" ref={(c) => email = c} /><br />
              <input type="password" id="password" placeholder="Password" ref={(c) => password = c} /><br />
              <input type="submit" id="deleteButton" class="buttons" value="Delete User" onClick={deleteUserSubmit} />
          </form>
          <span id="deleteUserResult">{message}</span>
      </div>
  );
};


export default DeleteUserButton