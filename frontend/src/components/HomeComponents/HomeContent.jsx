import CreatePostContainer from "./CreatePostContainer";
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
                </div>
                
            </div>
            
        </div>
        
    );
};


export default HomeContent;