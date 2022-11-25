import React from 'react';
import DisplayFriendsTable from './DisplayFriendsTable';
import TopBarProfile from './TopBarProfile';

const ProfileContent = () => {
    return (
        <div className="music-container">
            
            <TopBarProfile text = "ABOUT ME!"/>
            <div className="flex flex-col h-screen bg-brown-500 ml-32">
                <DisplayFriendsTable />
                
            </div>
            
        </div>
        
    );
};


export default ProfileContent;