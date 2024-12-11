import React,{useState,useEffect} from 'react'
import Avatar from './avatar.png'
import { auth } from '../firebase/firebase';
import { useChatStore } from '../firebase/chatStore';
import { useUserStore } from '../firebase/userStore';
function Profile(){
    const [users,setUsers] = useState([]);
    const {currentUser} = useUserStore();
    useEffect(() => {
        if (currentUser) {
            setUsers([currentUser]);
        }
    }, [currentUser]);

    return(
        <>
        <div className='md:w-full w-full z-10 border-l-2 border-black
         h-screen bg-[#edf6f9]'>
            <div className='h-[10vh] bg-[#006d77] p-3'>
                <p className='text-white text-2xl font-bold'>Profile</p>
            </div>
        {users.map((data)=>(
            <div className=' flex flex-col justify-center items-center h-1/3 m-1 border-b-2
             border-b-gray-700'>
            <img src={data.avatar || Avatar} alt="img" className='h-3/5 w-2/5 rounded-full' />
            <h2 className='m-2 text-lg font-semibold text-black'>{data.name}</h2>
            <p className='text-left text-black'>Greatfull for every sunrise and sunset</p>
            </div>
        ))} 
            {/*                                      buttons                               */}
            <div className='flex justify-center items-center w-full flex-col '>
            <button className='w-4/5 rounded-md  bg-red-500 text-white p-1 m-1'>Block User</button>
            <button onClick={()=>auth.signOut()}
            className='w-4/5 rounded-md  bg-blue-500 text-white p-1 m-1'>Logout</button>
        </div>
        </div>
       
        </>
    )
}
export default Profile;