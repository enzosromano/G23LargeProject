import React, { useState } from 'react';


// not sure if this will be used

function ResetPasswordPopup({active, close}) {
    
    
    if (!active) return (null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-brown-500 bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white p-4 font-semibold rounded-sm">
                
                <div className="mb-4 text-xl">Reset Password</div>
                {/* <form onSubmit={deleteUserSubmit} className="flex flex-col"> */}
                <form className="flex flex-col">
                    <label>Old Password</label>
                    {/* <input type="password" id="oldPassword" placeholder="Password" ref={(c) => email = c} className="text-gray-700 border-2 relative p-2 mb-4" /> */}
                    <input type="password" className="text-gray-700 border-2 relative p-2 mb-4" />
                    <label>New Password</label>
                    {/* <input type="password" id="newPassword" placeholder="Password" ref={(c) => password = c} className="text-gray-700 border-2 relative p-2 mb-4" /> */}
                    <input type="password" className="text-gray-700 border-2 relative p-2 mb-4" /> 
                    <div className="flex justify-evenly">
                        <button onClick={close} className="w-1/3 p-1 border border-green-500 bg-green-200 hover:bg-green-400"> cancel </button>
                        {/* <input type="submit" onClick={deleteUserSubmit} value="yes, reset my password" className="w-1/3 p-1 border border-red-500 bg-red-200 hover:bg-red-600 cursor-pointer"/> */}
                        <input type="submit" value="reset" className="w-1/3 p-1 border border-red-500 bg-red-200 hover:bg-red-600 cursor-pointer"/>
                    </div>
                </form>
                {/* <span id="resetPasswordResult" className="my-2 text-brown-600">{message}</span> */}
                
            </div>
        </div>
    );
    
    
};

export default ResetPasswordPopup;