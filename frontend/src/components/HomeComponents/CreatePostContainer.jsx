import React, { useState } from 'react';
import { MdOutlineManageSearch } from 'react-icons/md';

function CreatePostContainer() {

    const app_name = "tunetable23"
    
    function buildPath(route) {

        if (process.env.NODE_ENV === "production") { // TECH DEBT PROBLEM
            return "https://" + app_name + ".herokuapp.com/" + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    var searchMySong;
    var giveMyMessage;

    const [message, setMessage] = useState("");


    const createPostSubmit = async event => {
        event.preventDefault();
        
        
        try {
            const response = await fetch(buildPath('songs/search/' + searchMySong.value), { method: 'GET', headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res1 = JSON.parse(await response.text());

            if (!res1.success) {
                setMessage(JSON.stringify(res1));
            }
            else {
                var song = { songSearch: res1.results[0] };
                console.log(song);

                setMessage(JSON.stringify(res1.message));
                
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

        var obj = { message: giveMyMessage.value, song: searchMySong.value };
        console.log(obj)
        var js = JSON.stringify(obj);
        console.log(js)

        try {
            const response = await fetch(buildPath('posts/' + localStorage.getItem('userID')), { method: 'POST', body: js, headers: { 'authorization': 'Bearer ${token}', 'Content-Type': 'application/json' } });

            var res2 = JSON.parse(await response.text());

            if (!res2.success) {
                setMessage(JSON.stringify(res2));
            }
            else {
    

                setMessage(JSON.stringify(res2.message));
                window.location.reload(false);
            }
        }
        catch (e) {
            alert(e.toString());
            return;
        }

    }
    
    return (
    //     <div className="create-post-container">
    //     <form onSubmit={createPostSubmit}>
    //         <input type="text" id="provideSong" placeholder="Post Your Song!" ref={(c) => searchMySong = c} /><br />
    //         <input type="text" id="provideComment" placeholder="Post Your Message!" ref={(c) => giveMyMessage = c} /><br />
    //         <MdOutlineManageSearch size="24" className="my-auto" class="button" onClick={createPostSubmit} />
    //     </form>
    //     <span id="createPostResult">{message}</span>
    // </div>
        <div>

            <form onSubmit={createPostSubmit} className='flex h-40 items-center'>
                
                <div className="p-4 ml-3 mt-2 text-2xl text-white w-1/6 leading-[2]">choose today's song</div>
                <div className="flex flex-col mx-6">
                    <label className="font-semibold text-md text-white m-0.5">title</label>
                    <input type="text" id="provideSong" placeholder="Post Your Song!" ref={(c) => searchMySong = c} className="rounded-md focus:outline-none pl-1  bg-gray-200 " />
                </div>
            
                <div className="p-4 ml-3 mt-2 text-2xl text-brown-600 w-1/6 leading-[2]">choose today's message</div>
                <div className=" flex flex-col mx-6">
                    <label className="font-semibold text-md text-white m-0.5">message</label>
                    <input type="text" id="provideComment" placeholder="Post Your Message!" ref={(c) => giveMyMessage = c} className="rounded-md focus:outline-none pl-1 bg-gray-200" />
                </div>
                <input type="submit" onClick={createPostSubmit} value="submit" className="text-brown-600 p-2 ml-8 mt-4 border rounded-lg cursor-pointer font-semibold hover:bg-brown-600 hover:text-white hover:rounded-xl hover:border-none transition-all duration-200 ease-linear" />
            
            </form>
            
        </div>
    
    );
};


export default CreatePostContainer