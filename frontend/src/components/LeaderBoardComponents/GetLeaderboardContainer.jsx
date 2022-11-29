import React, { useState, useEffect } from 'react';
import _ from 'lodash';
//import { post } from '../../../../server';




function GetLeaderboardContainer() {

    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }
    
    const[posts, setPosts] = useState();
    const[message, setMessage] = useState();

    useEffect(() => {
        const loadPosts =async () => {
            
            //Get all user post
            try {
                const response = await fetch(buildPath('posts/' + localStorage.getItem('userID') + '/leaderboard'), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

                var res = JSON.parse(await response.text());

                if (!res.success) {
                    setMessage(JSON.stringify(res));
                }
                else {
                    console.log(res.results);
                        
                    setMessage(JSON.stringify(res.message));

                    setPosts(res.results.reverse());

                            
                }
            }
            catch (e) {
                alert(e.toString());
                return;
            }
            
        };

        loadPosts();
    }, []);
    
    
    if (JSON.stringify(posts) === '{}') {
        console.log("user posts empty");
        return (null);
    }

    return (
        <div className="Get-User-Post-Container">{
            !posts ? (<div> No Posts </div>) : (
                <table className='w-full table-auto'>
                    <thead className='text-white'>
                        <tr>
                            <th className='p-3 text-sm font-semibold tracking-wide'>Username</th>
                            <th className='p-3 text-sm font-semibold tracking-wide'>First Name</th>
                            <th className='p-3 text-sm font-semibold tracking-wide'>Last Name</th>
                            <th className='p-3 text-sm font-semibold tracking-wide'>Message</th>
                            <th className='p-3 text-sm font-semibold tracking-wide'>Likes</th>
                        </tr>
                    </thead>
                    <tbody className='text-white'>
                        {
                            posts.map((post, index) => (
                                <tr key={index}>
                                    <td className='p-3 text-sm font-semibold tracking-wide'>{post.creator.username}</td>
                                    <td className='p-3 text-sm font-semibold tracking-wide'>{post.creator.firstName}</td>
                                    <td className='p-3 text-sm font-semibold tracking-wide'>{post.creator.lastName}</td>
                                    <td className='p-3 text-sm font-semibold tracking-wide'>{post.message}</td>
                                    <td className='p-3 text-sm font-semibold tracking-wide'>{post.likes}</td>
                                   
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            )}
        <nav className="d-flex align-content: center">
            <ul className="pagination">
                {
                    
                    <li className='page-link'>1</li>
                    
                }
                
            </ul>
        </nav>
    </div>
    )
}

export default GetLeaderboardContainer