import {useEffect, useState} from 'react';
import {AiOutlineHeart} from 'react-icons/ai';

function OurTables() {


    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }
    
    
    const [userPosts, setUserPosts] = useState([]);
    const[message, setMessage] = useState();
    const [friendPosts, setFriendPosts] = useState([]);
    const [likedPosts, setLiked] = useState([]);
    
    
    useEffect( () => {
        
        const loadPosts = async () => {
            
            //Get all user post
            try {
                const response = await fetch(buildPath('posts/' + localStorage.getItem('userID')), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

                var res = JSON.parse(await response.text());

                if (!res.success) {
                    setMessage(JSON.stringify(res));
                }
                else {
                    console.log(res.results);
                        
                    setMessage(JSON.stringify(res.message));

                    setUserPosts(res.results);

                            
                }
            }
            catch (e) {
                alert(e.toString());
                return;
            }

            try {
                const response = await fetch(buildPath('posts/' + localStorage.getItem('userID') + '/friends'), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

                var res = JSON.parse(await response.text());

                if (!res.success) {
                    setMessage(JSON.stringify(res));
                }
                else {
                    console.log(res.results);
                        
                    setMessage(JSON.stringify(res.message));

                    setFriendPosts(res.results);

                            
                }
            }
            catch (e) {
                alert(e.toString());
                return;
            }
            
        };

        loadPosts();
    }, []); // fetch data only on component did mount
    
   
    
    if (JSON.stringify(friendPosts) === '{}') {
        console.log("friend posts empty");
        // return (<div className="text-white">user has no posts</div>);
        return(null);
    }

    if (JSON.stringify(userPosts) === '{}') {
        console.log("user posts empty");
        // return (<div className="text-white">user has no posts</div>);
        return(null);
    }
    
    return (
        <div>
            <table className="table-auto ">
                <thead className="text-brown-600 ">
                    <tr>
                        <th className="p-1 px-2">title</th>
                        <th className="p-1 px-2">artist</th>
                        <th className="p-1 px-2">album</th>
                        <th className="p-1 px-2">year</th>
                    </tr>
                </thead>
                
                <tbody className="text-gray-400 font-semibold">
                    {
                        userPosts.map((post, index) => (
                            <tr key={index}>
                                <td className="text-white p-1 px-2">{post.song.title}</td>
                                <td className="p-1 px-2">{post.song.artist}</td>
                                <td className="p-1 px-2">{post.song.album}</td>
                                <td className="p-1 px-2">{post.song.year}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            <table className="table-auto ">
                <thead className="text-brown-600 ">
                    <tr>
                        <th >user</th>
                        <th >title</th>
                        <th >artist</th>
                        <th >album</th>
                        <th >year</th>
                        <th >like</th>
                    </tr>
                </thead>
                
                <tbody className="text-gray-400 font-semibold">
                    {
                        friendPosts.map((post, index) => (
                            <tr key={index}>
                                <td className="text-white">{post.creator.username}</td>
                                <td className="text-white ">{post.song.title}</td>
                                <td>{post.song.artist}</td>
                                <td>{post.song.album}</td>
                                <td>{post.song.year}</td>
                                <td><LikeButton /></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            
        </div>
    );    

    
};

function LikeButton({}) {

    // need to be able to remember which songs are already liked
    // and reflect this with which heart is displayed (outline/filled)
    
    return (
        <div className='cursor-pointer'>
            <AiOutlineHeart size="24" />
        </div>
    );  

};


export default OurTables