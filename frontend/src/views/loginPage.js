import React from "react";

import  Login  from "../components/LoginComponents/loginV1";

const LoginPage = () => {

    return (
        <div>
            <Login />
            <button onClick={() => window.location.href = "/register"}>Don't have an Account? Register Here!</button>
        </div>
    )
}

export default LoginPage;