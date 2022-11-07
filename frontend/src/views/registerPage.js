import React from "react";

import  Register  from "../components/registerV1";

const RegisterPage = () => {

    return (
        <div>
            <Register />
            <button onClick={() => window.location.href = "/login"}>Already have an Account? Login Here!</button>
        </div>
    )
}

export default RegisterPage;