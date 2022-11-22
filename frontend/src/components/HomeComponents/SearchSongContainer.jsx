import React, { useState } from 'react';

function SearchSongContainer() {

    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var songToSearch;

    const [message, setMessage] = useState("");


    const searchSongSubmit = async event => {
        event.preventDefault();
        if("" === songToSearch.value || " " === songToSearch.value) {
            setMessage("Please provide a valid song name")
            return
        }

        

        try {
            const response = await fetch(buildPath('songs/search/' + songToSearch.value), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                var song = { title: res.results[0] };
                console.log(song);

                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return (
      <div className="search-song-container">
          <form onSubmit={searchSongSubmit}>
              <input type="text" id="username" placeholder="Head Strong" ref={(c) => songToSearch = c} /><br />
              <input type="submit" id="searchUserButton" class="buttons" value="Search Song" onClick={searchSongSubmit} />
          </form>
          <span id="songSearchResult">{message}</span>
      </div>
  );
};


export default SearchSongContainer