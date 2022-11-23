import React from "react";
import SideBar from "../components/SideBar";
import Leaderboard from "../components/LeaderBoardComponents/Leaderboard";

const LeaderboardPage = () => {

    return (
        // <div>
        //     <h1>Leaderboard Successful!</h1>
        // </div>
        <div className="flex">
            <SideBar />
            <Leaderboard />
        </div>
    )
}

export default LeaderboardPage;