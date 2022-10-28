import React from 'react';

const Login = () =>
{
    return(
        <div>
            <h1>Create a new account</h1>
            <div class="postForm">
                <div>
                    <label for="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName"/>
                </div>

                <div>
                    <label for="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName"/>
                </div>

                <div>
                    <label for="email">E-mail:</label>
                    <input type="text" id="email" name="email"/>
                </div>

                <div>
                    <label for="password">Password:</label>
                    <input type="text" id="password" name="password"/>
                </div>
            </div>
            <a href="login.html">Already have an account? Sign in!</a>
        </div>
    );
};

export default Login;