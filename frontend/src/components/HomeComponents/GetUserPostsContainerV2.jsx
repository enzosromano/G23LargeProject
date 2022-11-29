import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import DeletePostContainer from './DeletePostContainer';
//import { post } from '../../../../server';



function GetUserPostsContainerV2() {

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
          const response = await fetch(buildPath('posts/' + localStorage.getItem('userID')), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

          var res = JSON.parse(await response.text());

          if (!res.success) {
              setMessage(JSON.stringify(res));
          }
          else {
                console.log(res.results)
                

              setMessage(JSON.stringify(res.message));

              setPosts(res.results);

              
                
          }
      }
      catch (e) {
          alert(e.toString());
          return;
      }
        };

        loadPosts();
    }, []);
    
    

  return (
    <div className="Get-User-Post-Container">{
        !posts ? (<div> No Posts </div>) : (
            <table className='w-full table-auto'>
                <thead className='text-white'>
                    <tr>
                        <th className='p-3 text-sm font-semibold tracking-wide'>Song</th>
                        <th className='p-3 text-sm font-semibold tracking-wide'>Artist</th>
                        <th className='p-3 text-sm font-semibold tracking-wide'>Message</th>
                        <th className='p-3 text-sm font-semibold tracking-wide'>Likes</th>
                        <th className='p-3 text-sm font-semibold tracking-wide'>Delete Post</th>
                    </tr>
                </thead>
                <tbody className='text-white'>
                    {
                        posts.map((post, index) => (
                            <tr key={index}>
                                <td className='p-3 text-sm font-semibold tracking-wide'>{post.song.title}</td>
                                <td className='p-3 text-sm font-semibold tracking-wide'>{post.song.artist}</td>
                                <td className='p-3 text-sm font-semibold tracking-wide'>{post.message}</td>
                                <td className='p-3 text-sm font-semibold tracking-wide'>{post.likes}</td>
                                <td className='p-3 text-sm font-semibold tracking-wide'><DeletePostContainer postID={post._id}/></td>
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

export default GetUserPostsContainerV2