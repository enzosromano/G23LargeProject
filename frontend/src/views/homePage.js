import React from "react";
import SearchSongContainer from "../components/HomeComponents/SearchSongContainer";

const HomePage = () => {

    return (
        <div>
            <button onClick={() => window.location.href = "/profile"}>Go to your Profile Page!</button>
            < SearchSongContainer />
        </div>
    )
}

export default HomePage;