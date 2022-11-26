import React from "react";
import SideBar from '../components/SideBar';
import ProfileContent from '../components/ProfileComponents/ProfileContent'
import DeleteUserButton from "../components/ProfileComponents/DeleteUserButton";
import SearchUserContainer from "../components/ProfileComponents/SearchUserContainer";

const ProfilePage = () => {

    return (
        <div className="flex">
            <SideBar />
            <ProfileContent />
            {/*
            <DeleteUserButton />
            <SearchUserContainer />
            */}
        </div>
    )
}

export default ProfilePage;