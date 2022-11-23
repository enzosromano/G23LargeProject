import React from "react";
import SearchSongContainer from "../components/HomeComponents/SearchSongContainer";
import SideBar from '../components/SideBar';
import HomeContent from "../components/HomeComponents/HomeContent";

const HomePage = () => {

    return (
        
        <div className="flex">
            <SideBar />
            <HomeContent />
            {/*
            <SearchSongContainer />
            <button onClick={() => window.location.href = "/profile"}>Go to your Profile Page!</button> */}
        </div>
    )
}

export default HomePage;