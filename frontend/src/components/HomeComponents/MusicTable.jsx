import {useEffect, useState} from 'react';

import {AiOutlineHeart} from 'react-icons/ai';
import {AiFillHeart} from 'react-icons/ai';

function MusicTable() {
    
    const [friendPosts, setFriendPosts] = useState([]);
    const [likedPosts, setLiked] = useState([]);
    
    // isLiked is gotten by comparing user's localStorage likedPosts array with the post id
    // function likePost(postid, isLiked)
    //      if isliked -> like , else -> unlike
    // 
    
    
    // useEffect( () => {
        
        
    // }, []); // fetch data only on component did mount
    
    
    
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
                                <td className="text-white">{post.email}</td>
                                <td className="text-white ">{post.name}</td>
                                <td>Malcolm Lockyer</td>
                                <td>album</td>
                                <td>1961</td>
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