
import CreatePostContainer from "./CreatePostContainer";

import TopBarHome from "./TopBarHome"

import MusicTable from './MusicTable';
import UserMusicTable from './UserMusicTable';
//import PostTable from './PostTable';

const HomeContent = () => {
    return (
        // <div className="overflow-x-hidden">
            
        //     <TopBarHome text = "songs of the week."/>
        //     <div className=" bg-gradient-to-b from-brown-500 to-brown-300">
        //         <br/>
        //         <div className="ml-32">
        //             <div className='ml-6 text-white'>Your Posts!</div>
        //             <GetUserPostsContainerV2 />
        //             <CreatePostContainer />
        //             <DeletePostContainer />
        //             <GetUserPostsContainer />
        //             <GetFriendsPostContainer />
        //         </div>
                
        //     </div>
            
        // </div>
        
        <div className="overflow-x-hidden">
            
            <TopBarHome text = "songs of the week."/>
            <div className=" bg-gradient-to-b from-brown-500 to-brown-300 h-screen">
                
                <div className="ml-32 flex flex-col ">
                        
                    <CreatePostContainer />
                        
                    <div className="p-4 ml-3 pt-5 font-semibold text-3xl text-white border-t-4 border-brown-200 border-dashed">vote on your friends' songs!</div>
                
                </div>
                
                <div >
                    <div className="ml-36 pb-6 ">
                        <MusicTable />
                    </div>
                    <div className="p-4 ml-36 pt-5 font-semibold text-xl text-white">your posted songs</div>
                    <div className="ml-36 pb-6 ">
                        <UserMusicTable />
                    </div>
                    {/* <div className="mt-10 pb-8 ml-36 w-screen">
                        <div className="ml-20 font-semibold text-xl text-brown-600"> messages of the week </div>
                        <PostTable />
                        
                    </div> */}
                </div>
                
            </div>
            
        </div>
        
    );
};


export default HomeContent;