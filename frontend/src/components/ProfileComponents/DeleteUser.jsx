import React, { useState } from 'react'

function DeleteUser() {

    const app_name = "tunetable23"
    function buildPath(route) {

        if (process.env.NODE_ENV !== "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }


    const deleteUserSubmit = async event => {

    }



  return (
    <div id="deleteUserDiv">
        <form onSubmit={deleteUserSubmit}>
                <input type="submit" id="deleteUserButton" class="buttons" value="Delete Account" onClick={deleteUserSubmit} />
            </form>
    </div>
  );
};

export default DeleteUser   