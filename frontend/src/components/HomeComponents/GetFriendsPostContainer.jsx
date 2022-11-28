import { useState } from "react"


function GetFriendsPostContainer() {


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

  const getFriendsPostsSubmit = async event => {
      event.preventDefault();
    
      //Get all user post
      try {
          const response = await fetch(buildPath('posts/' + localStorage.getItem('userID') + '/friends'), { method: 'GET', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

          var res = JSON.parse(await response.text());

          if (!res.success) {
              setMessage(JSON.stringify(res));
          }
          else {
    

              setMessage(JSON.stringify(res.message));
              console.log(res.results)
                
          }
      }
      catch (e) {
          alert(e.toString());
          return;
      }
    }

    
  return (
    <div>
      <form onSubmit={getFriendsPostsSubmit}>
        <input type="submit" id="getUserPostsButton" class="buttons" value="Check my Friend's post!" onClick={getFriendsPostsSubmit} />
      </form>
      <span id="getUserPostResult">{message}</span>
      <br />
    </div>
  )
};


export default GetFriendsPostContainer