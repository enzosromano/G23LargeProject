import React from 'react'

function DeleteUserButton() {


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

export default DeleteUserButton