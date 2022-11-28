import React, { useState } from 'react';

const ChangePasswordPage = () => {
    
    return(
        <div className="relative w-full h-screen">
        
            <div className=" w-full h-full bg-login_bg bg-center">
            
                <div className="flex justify-center h-full items-center">
                    <form className="w-full max-w-[400px] mx-auto bg-brown-400/90 p-8 rounded-lg flex flex-col">
                        <div className="text-brown-600 text-2xl font-bold text-center py-6">almost there!</div>
                        <div className="text-white font-semibold text-center mb-4">type new password</div>
                    
                        <label className="text-brown-600 font-semibold">new password</label>
                        <input type="password" id="password" className="text-white relative bg-brown-500 p-2 focus:outline-none" />
                    
                        <input type="submit" class="buttons" id="loginButton" value="submit" className="cursor-pointer w-full py-3 mt-8 shadow-2xl bg-brown-200 font-semibold text-white hover:bg-brown-600 hover:rounded-xl transition-all duration-100 ease-linear" />
                    
                    
                    </form>
                    {/* <span>{message}</span> */}
                </div>
            </div>
        
        </div>  
        
    );
};

export default ChangePasswordPage;