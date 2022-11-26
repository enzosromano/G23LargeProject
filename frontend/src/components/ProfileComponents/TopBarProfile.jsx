import React from 'react';
import { BsMusicNoteList } from 'react-icons/bs';
import SearchUserContainer from './SearchUserContainer';
import AddFriendContainer from './AddFriendContainer'
import DeleteUserButton from './DeleteUserButton';


const TopBarProfile = ({text}) => {
    return (
        // styling in index.css
        <div className='ml-32 flex border-x-0 border-t-0 border border-brown-600 '>
            <div className="top-bar"> 
                <div className='flex flex-row justify-evenly'>
                    <MusicIcon />
                    <h4 className="top-text">{text}</h4>
                </div>
                
                <div className= 'flex flex-row justify-right'>
                    <AddFriendContainer />
                    <DeleteUserButton />
                </div>
               
                    
            </div>
                
        </div> 
    );
}


const MusicIcon = () => (
    <div className="flex items-center justify-start">
        <BsMusicNoteList size="24" className="top-bar-icon" />
        <span className="font-semibold text-brown-600">TuneTable</span>
    </div>
)

export default TopBarProfile;