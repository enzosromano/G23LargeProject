import {useEffect, useState} from 'react';


function UserMusicTable() {
    
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
            
        };

        loadPosts();
    }, []); // fetch data only on component did mount
    
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
            
        </div>
    );    
};


export default UserMusicTable;