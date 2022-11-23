import React from "react";

import DeleteUserButton from "../components/ProfileComponents/DeleteUserButton";
import SearchUserContainer from "../components/ProfileComponents/SearchUserContainer";

const ProfilePage = () => {

    return (
        <div>
            <DeleteUserButton />
            <SearchUserContainer />
        </div>
    )
}

export default ProfilePage;