import { useState } from "react"


function GetUserPostsContainer() {


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
  const [userMessagePost, setUserMessagePost] = useState("");
  const [userSongPost, setUserSongPost] = useState("");
  const [userLikesPost, setUserLikesPost] = useState("");
  const [userUpdatedAtPost, setUserUpdatedAtPost] = useState("");


  const getUserPostsSubmit = async event => {
      event.preventDefault();
    
      //Get all user post
      try {
          const response = await fetch(buildPath('posts/' + localStorage.getItem('userID')), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

          var res = JSON.parse(await response.text());

          if (!res.success) {
              setMessage(JSON.stringify(res));
          }
          else {
    

              setMessage(JSON.stringify(res.message));

              for(let i = 0; i < res.results.length; ++i){
                setUserMessagePost(JSON.stringify(res.results[i].message))
                setUserSongPost(JSON.stringify(res.results[i].song))
                setUserLikesPost(JSON.stringify(res.results[i].likes))
                setUserUpdatedAtPost(JSON.stringify(res.results[i].updatedAt))
              }
                
          }
      }
      catch (e) {
          alert(e.toString());
          return;
      }
    }

    
  return (
    <div>
      <form onSubmit={getUserPostsSubmit}>
        <input type="submit" id="getUserPostsButton" class="buttons" value="Grab My Posts!" onClick={getUserPostsSubmit} />
      </form>
      <span id="getUserPostResult">{message}</span>
      <span id="getUserPostResultResources">{userMessagePost}</span>
      <span id="getUserPostResultResources">{userSongPost}</span>
      <span id="getUserPostResultResources">{userLikesPost}</span>
      <span id="getUserPostResultResources">{userUpdatedAtPost}</span>
      <br />
    </div>
  )
};


export default GetUserPostsContainer