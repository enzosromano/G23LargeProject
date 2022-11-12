import React from "react";

const HomePage = () => {

    return (
        <div>
            <h1> Login/Router Successful!</h1>
            <button onClick={() => window.location.href = "/profile"}>Go to your profile page!</button>
        </div>
    )
}

export default HomePage;