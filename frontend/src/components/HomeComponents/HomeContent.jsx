// import CreatePostContainer from "./CreatePostContainer";
// import DeletePostContainer from "./DeletePostContainer";
// import GetFriendsPostContainer from "./GetFriendsPostContainer";
// import GetUserPostsContainer from "./GetUserPostsContainer";
// import GetUserPostsContainerV2 from "./GetUserPostsContainerV2";
import TopBarHome from "./TopBarHome"

// import MusicTable from './MusicTable';
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
            <div className=" bg-gradient-to-b from-brown-500 to-brown-300">
                
                <div className="ml-32 flex flex-col ">
                    <div className="flex h-48 items-center mb-2">
                        <div className="p-4 ml-3 mt-2 text-2xl text-white w-3/12 leading-[2]">choose today's song</div>
                        <form className=" mt-1 flex flex-col">
                            <label className="font-semibold text-md text-white m-0.5">title</label>
                            <input type="text" className="rounded-md focus:outline-none pl-1 bg-gray-200" />
                            <label className="font-semibold text-md text-white m-0.5">artist</label>
                            <input type="text" className="rounded-md  focus:outline-none pl-1 bg-gray-200" />
                            <input type="submit" value="submit" className="m-3 text-brown-600 p-1 border rounded-lg cursor-pointer font-semibold hover:bg-brown-600 hover:text-white hover:rounded-xl hover:border-none transition-all duration-200 ease-linear" />
                        </form>
                        <div className="p-4 ml-10 mt-2 text-2xl text-brown-600 w-3/12 leading-[2]">post today's message</div>
                        <form className=" flex flex-col mt-14">
                            <label className="font-semibold text-md text-white m-0.5">message</label>
                            <input type="text" className="rounded-md focus:outline-none pl-1 bg-gray-200" />
                            <input type="submit" value="submit" className="m-3 text-brown-600 p-1 border rounded-lg cursor-pointer font-semibold hover:bg-brown-600 hover:text-white hover:rounded-xl hover:border-none transition-all duration-200 ease-linear" />
                        </form>
                    </div>
                    
                    <div className="p-4 ml-3 pt-5 font-semibold text-3xl text-white border-t-4 border-brown-200 border-dashed">vote on your friends' songs!</div>
                
                </div>
                
                <div >
                    {/* <div className="ml-36 pb-6 ">
                        <MusicTable />
                    </div> */}
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