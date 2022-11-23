import TopBar from "../TopBar";

const HomeContent = () => {
    return (
        <div className="music-container">
            
            <TopBar text = "songs of the week."/>
            <div className="music-table">
                <br/>
                <div className="ml-32">
                    <div className='ml-6 text-white'>curated by your friends!</div>
                </div>
                
            </div>
            
        </div>
        
    );
};


export default HomeContent;