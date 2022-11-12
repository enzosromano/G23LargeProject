import React from "react";

const HomePage = () => {

    return (
        <div>
            <button onClick={() => window.location.href = "/profile"}>Go to your Profile Page!</button>
        </div>
    )
}

export default HomePage;