import { BsMusicNoteList } from 'react-icons/bs';


const TopBarHome = ({text}) => {
    return (
        // styling in index.css
        <div className='ml-32 flex border-x-0 border-t-0 border border-brown-600 '>
            <div className="top-bar"> 
                <div className='flex flex-row justify-evenly'>
                    <MusicIcon />
                    <h4 className="top-text">{text}</h4>
                    <input type="submit" onClick={() => window.location.href = "/"} value="logout" className="text-brown-600 p-2 ml-8 mt-4 border rounded-lg cursor-pointer font-semibold hover:bg-brown-600 hover:text-white hover:rounded-xl hover:border-none transition-all duration-200 ease-linear" />
                </div>   
            </div>
                
        </div> 
    );
}


const MusicIcon = () => (
    <div className="flex items-center justify-start">
        <BsMusicNoteList size="24" className="top-bar-icon" />
        <span className="font-semibold text-brown-600">TuneTable</span>
    </div>
)

export default TopBarHome;