import React, { useState } from "react";

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
    }
    return (
        <div className="auth-form-container">
            <form onSubmit={handleSubmit}>
                <label htmlfor="email">email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ianfrelix@yahoo.com" id="email" name="email"/>
                <label htmlfor="password">password</label>
                <input value={pass} onChnage={(e) => setPass(e.target.value)} type="password" placeholder="*********" id="password" name="password"/>
                <button>Log In</button>
            </form>
            <button onClick={() => props.onFormSwitch("register")}>Don't have an Account? Register Here!</button>
        </div>
    )
}