import React from "react";
import GetLeaderboardContainer from "./GetLeaderboardContainer";
//import LeaderBoardTable from "./LeaderBoardTable";
import TopBarLeaderboard from "./TopBarLeaderboard";


// I was thinking that instead of a plain html table we place a <LeaderboardEntry> element
// for every friend in leaderboard with their information (user/num_likes for the week/maybe pfp)
function Leaderboard() {
    
    
    
    
    return (
        <div className="flex flex-col m-0 h-full w-full overflow-x-hidden">
            <TopBarLeaderboard text = "this week's leaderboard."/>
            
            <div className="flex flex-col h-screen bg-gradient-to-b from-brown-500 to-brown-300 ml-32">

                <GetLeaderboardContainer />
            </div>
            
        </div>
        
    );  
};

const LeaderboardEntry = ({username, num_likes}) => (
    <div className="flex mx-10 my-6 rounded-lg bg-brown-200 shadow-2xl text-white ">
        <ProfilePic pfp={username}/> 
        
            <span className="w-7/12 mx-4 text-xl font-semibold leading-[5]"> {username} </span>
            {/* <span className="w-7/12 mx-4 text-xl font-semibold leading-[5]"> list of songs from that week?: </span> */}
            <div className="w-2/12 text-end">
                <span className="justify mx-2 text-xl font-semibold leading-[5]"> likes:</span>
                <span className="align-sub text-4xl font-bold text-brown-600 shadow-2xl">{num_likes}</span>
            </div>
        
    </div>
);


const ProfilePic = ({pfp}) => {
    
    // instead of this placeholder pfp system, probably need to get img from API
    
    let url = 'https://avatars.dicebear.com/api/open-peeps/' + pfp +'.svg';
    return (
        <div className="flex flex-wrap justify-center">
            <div className="w-full m-2 px-1 bg-brown-300 rounded-full">
                <img src={url} alt="pfp" className="shadow-lg rounded-full w-20 h-full align-middle border-none" />
            </div>
        </div>
    );
}

export default Leaderboard;