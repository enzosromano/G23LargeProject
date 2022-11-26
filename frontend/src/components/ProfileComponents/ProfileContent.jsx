import React from 'react';
import BlockUserContainer from './BlockUserContainer';
import DisplayFriendsTable from './DisplayFriendsTable';
import TopBarProfile from './TopBarProfile';

const ProfileContent = () => {
    return (
        <div className="music-container">
            
            <TopBarProfile text = "ABOUT ME!"/>
            <div className="flex flex-col h-screen bg-brown-500 ml-32">
                <DisplayFriendsTable />
                <BlockUserContainer />
                
            </div>
            
        </div>
        
    );
};


export default ProfileContent;