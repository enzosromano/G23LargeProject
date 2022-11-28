
// npm install react-icons --save
import { TbVinyl} from 'react-icons/tb';
import { MdOutlineLeaderboard } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { Link } from "react-router-dom"

const SideBar = () => {
    return (
        <div className="fixed top-0 left-0 h-screen w-32 m-0 flex flex-col bg-brown-300 text-white shadow-xl">
            <SideBarIcon icon={<TbVinyl size = "64" />} text="home" routing="/home" />
            <SideBarIcon icon={<MdOutlineLeaderboard size = "64" />} text="leaderboard" routing="/board" />
            <SideBarIcon icon={<CgProfile size = "64" />} text="profile" routing="/profile"/>
        </div>
    );
};

const SideBarIcon = ({ icon, text, routing }) => (
    
    // fixed sidebar help tip positioning
    <button className="sidebar-icon group" onClick={() => window.location.href = routing}>
    
        {icon}
        <span className="sidebar-help group-hover:scale-100">
            {text}
        </span>

    </button>
    

);

// this side bar will be used across leaderboard/profile/home
export default SideBar;