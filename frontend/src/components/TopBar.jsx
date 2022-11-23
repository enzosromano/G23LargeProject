import { BsMusicNoteList } from 'react-icons/bs';
import { MdOutlineManageSearch } from 'react-icons/md';

// const TopBar = () => {
//     return (
//         // styling in index.css
//         <div className="top-bar"> 
            
//             <MusicIcon />
//             <h4 className="top-text">Songs of the Day -- Picked by Your Friends!</h4>
//             <Search />
            
//         </div> 
//     );
// }
const TopBar = ({text}) => {
    return (
        // styling in index.css
        <div className='ml-32 flex border-x-0 border-t-0 border border-brown-600 '>
            <div className="top-bar"> 
                <div className='flex flex-row justify-evenly'>
                    <MusicIcon />
                    <h4 className="top-text">{text}</h4>
                </div>
                <Search />
                    
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
const Search = () => (
    <div className="search">
        <MdOutlineManageSearch size="20" className="my-auto" />
        <input className="search-input" type="text" placeholder="search..." />
    </div>
);

export default TopBar;