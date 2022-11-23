import React, { useState } from 'react';

function SearchUserContainer() {

    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var userToSearch;

    const [message, setMessage] = useState("");


    const searchUserSubmit = async event => {
        event.preventDefault();

        if("" === userToSearch.value || " " === userToSearch.value) {
            setMessage("Please provide a valid name")
            return
        }

        

        try {
            const response = await fetch(buildPath('users/search/' + userToSearch.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                console.log(Object.keys(res))

                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return (
      <div className="search-user-container">
          <form onSubmit={searchUserSubmit}>
              <input type="text" id="username" placeholder="Ethan Romano" ref={(c) => userToSearch = c} /><br />
              <input type="submit" id="searchUserButton" class="buttons" value="Search User" onClick={searchUserSubmit} />
          </form>
          <span id="searchUserResult">{message}</span>
      </div>
  );
};


export default SearchUserContainer