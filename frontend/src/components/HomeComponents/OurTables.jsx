import {useEffect, useState} from 'react';
import {AiFillDislike} from 'react-icons/ai';
import {AiFillLike} from 'react-icons/ai';

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
                        <th >unlike</th>
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
                                <td><LikeButton postID={post._id}/></td>
                                <td><UnLikeButton postID={post._id}/></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            
        </div>
    );    

    
};

function LikeButton({postID}) {

    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    console.log(postID)
    const [message, setMessage] = useState("");


    const likeSubmit = async event => {
        event.preventDefault();


        try {
            //Needs postId and userId
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/like/' + postID), { method: 'POST', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
    

                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return (
        <div className='cursor-pointer'>
            <form onSubmit={likeSubmit}>
                <AiFillLike size="24" className="my-auto" class="button" onClick={likeSubmit}/>
            </form>
        </div>
    );  

};

function UnLikeButton({postID}) {

    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    console.log(postID)
    const [message, setMessage] = useState("");


    const dislikeSubmit = async event => {
        event.preventDefault();


        try {
            //Needs postId and userId
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/unlike/' + postID), { method: 'POST', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
    

                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return (
        <div className='cursor-pointer'>
            <form onSubmit={dislikeSubmit}>
                <AiFillDislike size="24" className="my-auto" class="button" onClick={dislikeSubmit}/>
            </form>
        </div>
    );  

};


export default OurTables