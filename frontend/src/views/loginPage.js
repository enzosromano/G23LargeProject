import React from "react";

import  Login  from "../components/loginV1";

const LoginPage = () => {

    return (
        <div>
            <Login />
            {/* <button onClick={() => props.onFormSwitch("registerPage")}>Don't have an Account? Register Here!</button> */}
        </div>
    )
}

export default LoginPage;