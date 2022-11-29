import React, { useState, useEffect } from 'react';
import DeleteFriendContainer from '../DeleteFriendContainer';


function ViewFriendsPopup({active, close}) {
    
    
    const app_name = "tunetable23";
    
    function buildPath(route) {
        console.log('good')

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    const [message, setMessage] = useState("");
    const [resources, setResources] = useState([]);

    
    const getFriendsSubmit = async event => {
        event.preventDefault();
        
        
        try {
            const response = await fetch(buildPath('users/' + localStorage.getItem('userID') + '/friends'), { method: 'GET', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (!res.success) {
                setMessage(JSON.stringify(res));
            }
            else {
                console.log(res.results)
                setResources(res.results)
                setMessage(JSON.stringify(res.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
   
    
       
    
    
    
    if (!active) return (null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-30 backdrop-blur-sm">
                
                <div className="flex flex-col w-full max-w-[400px] mx-auto bg-brown-400/90 p-4 rounded-lg font-semibold">
                
                <table className='w-full table-auto'>
                        <thead className='text-white'>
                            <tr>
                                <th className='p-3 text-sm font-semibold tracking-wide'>Username</th>
                                <th className='p-3 text-sm font-semibold tracking-wide'>First Name</th>
                                <th className='p-3 text-sm font-semibold tracking-wide'>Last Name</th>
                                <th className='p-3 text-sm font-semibold tracking-wide'>Total Likes</th>
                                <th className='p-3 text-sm font-semibold tracking-wide'>Delete Friend</th>
                            </tr>
                        </thead>
                        <tbody className='text-white'>
                        
                            {
                                resources.map((resource, index) => (
                                    
                                    <tr key={index}>
                                        <td className='p-3 text-sm font-semibold tracking-wide'>{resource.username}</td>
                                        <td className='p-3 text-sm font-semibold tracking-wide'>{resource.firstName}</td>
                                        <td className='p-3 text-sm font-semibold tracking-wide'>{resource.lastName}</td>
                                        <td className='p-3 text-sm font-semibold tracking-wide'>{resource.totalLikes}</td>
                                        <td className='p-3 text-sm font-semibold tracking-wide'><DeleteFriendContainer postID={resource.id}/></td>
                                    </tr>
                            
                                ))
                            }
                        </tbody>
                     </table>
                     <button onClick={getFriendsSubmit} className="w-1/3 text-white p-1 my-1 border"> Get Friends </button>
                    <button onClick={close} className="w-1/3 text-white p-1 my-1 border"> close </button>
                </div>
                
            
        </div>
    );
};

export default ViewFriendsPopup;