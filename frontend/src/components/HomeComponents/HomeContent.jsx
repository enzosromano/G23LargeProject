import CreatePostContainer from "./CreatePostContainer";
import DeletePostContainer from "./DeletePostContainer";
import GetFriendsPostContainer from "./GetFriendsPostContainer";
import GetUserPostsContainer from "./GetUserPostsContainer";
import TopBarHome from "./TopBarHome"

const HomeContent = () => {
    return (
        <div className="music-container">
            
            <TopBarHome text = "PROVIDE A SONG TO VOTE!"/>
            <div className="music-table">
                <br/>
                <div className="ml-32">
                    <div className='ml-6 text-white'>curated by your friends!</div>
                    <CreatePostContainer />
                    <DeletePostContainer />
                    <GetUserPostsContainer />
                    <GetFriendsPostContainer />
                </div>
                
            </div>
            
        </div>
        
    );
};


export default HomeContent;