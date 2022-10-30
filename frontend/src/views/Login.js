import React from 'react';

const Login = () =>
{
    return(
        <div>
            <h1>Sign in</h1>
            <div class="postForm">
                <div>
                    <label for="email">E-mail:</label>
                    <input type="text" id="email" name="email"/>
                </div>
            
                <div>
                    <label for="password">Password:</label>
                    <input type="text" id="password" name="password"/>
                </div>
            </div>
            <a href="register.html">Don't have an account? Sign up!</a>
        </div>
    );
};

export default Login;