import {useEffect, useState} from 'react';

import {AiOutlineHeart} from 'react-icons/ai';
import {AiFillHeart} from 'react-icons/ai';


// SKELETON --------------- UNFINISHED


 // isLiked is gotten by comparing user's localStorage likedPosts array with the post id
    // function likePost(postid, isLiked)
    //      if isliked -> like , else -> unlike
    // 


function MusicTable() {
    
    
    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }
    
    const [message, setMessage] = useState();
    const [friendPosts, setFriendPosts] = useState([]);
    const [likedPosts, setLiked] = useState([]);
    
    
    useEffect( () => {
        const loadPosts = async () => {
            
            //Get all user post
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
    
    return (
        <div>
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


export default MusicTable;