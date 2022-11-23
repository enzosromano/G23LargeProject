
// npm install react-icons --save
import { TbVinyl} from 'react-icons/tb';
import { MdOutlineLeaderboard } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';

const SideBar = () => {
    return (
        <div className="fixed top-0 left-0 h-screen w-32 m-0 flex flex-col bg-brown-300 text-white shadow-xl">
            <SideBarIcon icon={<TbVinyl size = "64" />} text="home" />
            <SideBarIcon icon={<MdOutlineLeaderboard size = "64" />} text="leaderboard" />
            <SideBarIcon icon={<CgProfile size = "64" />} text="profile" />
        </div>
    );
};

const SideBarIcon = ({ icon, text }) => (
    
    <div className="sidebar-icon group">
        
        {icon}
        <span className="sidebar-help group-hover:scale-100">
            {text}
        </span>
        
    </div>
);

// this side bar will be used across leaderboard/profile/home
export default SideBar;