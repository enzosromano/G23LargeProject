import React, {useState} from "react";

// import BlockUserContainer from './BlockUserContainer';
// import DisplayFriendsTable from './DisplayFriendsTable';
// import TopBarProfile from './TopBarProfile';
// import UnblockUserContainer from './UnblockUserContainer';

import DeleteUserPopup from "./popups/DeleteUserPopup";
import AddFriendPopup from "./popups/AddFriendPopup";
import RemoveFriendPopup from "./popups/RemoveFriendPopup";
import BlockUserPopup from "./popups/BlockUserPopup";
import UnblockUserPopup from "./popups/UnblockUserPopup";
import ViewFriendsPopup from "./popups/ViewFriendsPopup";
import ResetPasswordPopup from "./popups/ResetPasswordPopup";

const ProfileContent = () => {
    
    const [delUserPopup, setDelUserPopup] = useState(false);
    const delUserClose = () => setDelUserPopup(false);
    
    const [addFriendPopup, setAddFriendPopup] = useState(false);
    const addFriendClose = () => setAddFriendPopup(false);
    
    const [removeFriendPopup, setRemoveFriendPopup] = useState(false);
    const removeFriendClose = () => setRemoveFriendPopup(false);
    
    const [blockUserPopup, setBlockUserPopup] = useState(false);
    const blockUserClose = () => setBlockUserPopup(false);
    
    const [unblockUserPopup, setUnblockUserPopup] = useState(false);
    const unblockUserClose = () => setUnblockUserPopup(false);
    
    const [viewFriendsPopup, setViewFriendsPopup] = useState(false);
    const viewFriendsClose = () => setViewFriendsPopup(false);
    
    const [resetPasswordPopup, setResetPasswordPopup] = useState(false);
    const resetPasswordClose = () => setResetPasswordPopup(false);
    
    let email = localStorage.getItem('email');
    
    return (
        <div>
            <div className="bg-brown-500 h-screen w-screen flex items-center justify-center">
                <div className="bg-brown-200 w-full max-w-[450px] rounded-lg text-center flex flex-col items-center p-6">
                    <img src="https://avatars.dicebear.com/api/open-peeps/1.svg" className="rounded-full w-32" alt="pfp" />
                    <div className="m-4 text-4xl font-semibold text-brown-600"> Xxian69xX </div>
                    <div className="font-semibold text-white my-2">Account Email: {email}</div>
                    {/* these are pop ups */}
                    <button onClick={() => setViewFriendsPopup(true)} className="profile-text-btn">View Friends</button>
                    <button onClick={() => setAddFriendPopup(true)} className="profile-text-btn">Add Friend</button>
                    <button onClick={() => setRemoveFriendPopup(true)} className="profile-text-btn">Remove Friend</button>
                    <button onClick={() => setBlockUserPopup(true)} className="profile-text-btn">Block User</button>
                    <button onClick={() => setUnblockUserPopup(true)} className="profile-text-btn">Unblock User</button>
                    <button onClick={() => setResetPasswordPopup(true)} className="profile-text-btn text-yellow-600 border-yellow-600 hover:text-white hover:bg-yellow-500">Reset Password</button>
                    <button onClick={() => setDelUserPopup(true)} className="profile-text-btn text-red-500 border-red-500 hover:text-white hover:bg-red-400">Delete Account</button>
                </div>
                    
            </div>
            <ViewFriendsPopup active={viewFriendsPopup} close={viewFriendsClose} />
            <AddFriendPopup active={addFriendPopup} close={addFriendClose} />
            <RemoveFriendPopup active={removeFriendPopup} close={removeFriendClose} />
            <BlockUserPopup active={blockUserPopup} close={blockUserClose} />
            <UnblockUserPopup active={unblockUserPopup} close={unblockUserClose} />
            <ResetPasswordPopup active={resetPasswordPopup} close={resetPasswordClose} />
            <DeleteUserPopup active={delUserPopup} close={delUserClose} />
            
        </div>
    );
};


export default ProfileContent;