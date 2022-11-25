import TopBarLeaderboard from "./TopBarLeaderboard";


const Leaderboard = () => {
    return (
        <div className="flex flex-col m-0 h-full w-full overflow-hidden">
            <TopBarLeaderboard text = "THIS WEEK'S LEADERBOARD."/>
            
            <div className="flex flex-col h-screen bg-brown-500 ml-32">
                <LeaderboardEntry username="samu_420" pfp="21"/>
                <LeaderboardEntry username="Xxian69xX" pfp="61"/>
            </div>
            
        </div>
        
    );    
};

const LeaderboardEntry = ({username, pfp}) => (
    <div className="flex flex-row mx-10 my-10 rounded-lg bg-brown-100 text-white content-center">
        <ProfilePic pfp="23"/> 
        <div className="font-semibold "> {username} </div>
    </div>
);

// for some reason capitalization matters
const ProfilePic = ({pfp}) => (
    
    
    // instead of this placeholder pfp system, probably need to get img from API
    <div className="flex flex-wrap justify-center">
        <div className="w-full m-2 px-1">
            <img src={'https://avatars.dicebear.com/api/open-peeps/{pfp}.svg'} alt="..." className="shadow-lg rounded-full w-20 h-full align-middle border-none" />
        </div>
    </div>
);

export default Leaderboard;