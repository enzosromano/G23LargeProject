import React from "react";

import { Register } from "../components/register";

export const RegisterPage = (props) => {

    return (
        <div>
            <Register />
            <button onClick={() => props.onFormSwitch("loginPage")}>Don't have an Account? Register Here!</button>
        </div>
    )
}