import React, { useState } from "react";
export const Register = () => {
   
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
    }


    return (
        <div className="auth-form-container">
            <form onSubmit={handleSubmit}>
                <label htmlfor="first Name">firstName</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" id="first Name" name="first Name"/>

                <label htmlfor="last Name">lastName</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Bui" id="last Name" name="last Name"/>

                <label htmlfor="email">email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ianfrelix@yahoo.com" id="email" name="email"/>

                <label htmlfor="password">password</label>
                <input value={pass} onChnage={(e) => setPass(e.target.value)} type="password" placeholder="*********" id="password" name="password"/>
                <button>Register</button>
            </form>
        </div>
    )
}