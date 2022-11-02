import React from "react";

import  Login  from "../components/loginV1";

export const LoginPage = (props) => {

    return (
        <div>
            <Login />
            <button onClick={() => props.onFormSwitch("registerPage")}>Don't have an Account? Register Here!</button>
        </div>
    )
}

