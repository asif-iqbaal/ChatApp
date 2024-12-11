import React, { useEffect, useState } from 'react';
import Avatar from './avatar.png'
import Edit from './edit.png'
import More from './more.png'
import Search from './search.png'
import Plus from './plus.png'
import Minus from './minus.png'
import { auth } from '../firebase/firebase';
import AddUser from '../addUser/addUser';
import { useUserStore } from '../firebase/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useChatStore } from '../firebase/chatStore';
import { useNavigate } from 'react-router-dom';
import Loading from '../loading/loading';
import { useWindowSize } from 'react-use';

function Chat() {
    const { width } = useWindowSize();
    const isLargeScreen = width > 768; // You can adjust the breakpoint as needed
    const { currentUser, isLoading } = useUserStore();
    const { chatId, changeChat } = useChatStore();
    const [openProfile, setOpenProfile] = useState(false);
    const [chats, setChats] = useState([])
    const [add, setAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addUser, setAddUser] = useState(false);

    const addHandle = () => {
        setAdd((prev) => !prev);
        setAddUser((prev) => !prev);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // 2000 milliseconds = 2 seconds

        return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchat", currentUser.id), async (res) => {
            const data = res.data();
           
            if (data) {


                const items = Array.isArray(data.chats) ? data.chats : [];
                console.log("items", items);

                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "users", item.receiverId);
                    console.log(userDocRef);
                    const userDocSnap = await getDoc(userDocRef);

                    const user = userDocSnap.data();

                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);
                // sort chat by  updated recently
                setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
            } else {
                setChats([]);
            }
        });

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const navigate = useNavigate();

    const handleSelect = async (chat) => {
        const userChats = chats.map(item => {
            const { user, ...rest } = item;
            return rest;
        });
        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId)
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchat", currentUser.id)
            ;
        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user)
            if (window.innerWidth < 768) {
                navigate('/chat');
            }
        } catch (error) {
            console.log(error);
        }
        //  navigate('/chat')

    };
    console.log("chatdetails", chats);

    const handleProfile = () => {
        setOpenProfile((prev) => !prev)
    }

    const profile = ()=>{
        navigate('/profile')
    }


    if (loading) {
        return (
            <div className='h-screen w-screen flex  justify-center items-center'>
                <Loading />
            </div>
        );
    }
    return (

        <div className='w-full   md:w-1/4 h-screen bg-[#edf6f9] overflow-y-scroll 
         hide-scrollbar border-r-2 border-gray-700 transition-transform'>
            {/*                                        header                                 */}
            <div className='flex justify-between w-full p-3  h-[10vh] bg-[#006d77]'>
                <div className=' flex h-12 m-1 '>

                    <img src={currentUser.avatar || Avatar} alt="img" className='h-9 md:h-full w-8 md:w-12 rounded-3xl' />
                    <h3 className='m-2 text-white font-serif font-bold'>{currentUser.name}</h3>
                </div>
                <div className='flex justify-center items-center'>

                    <img src={More} alt="" className=' h-4 md:h-6 m-2' onClick={handleProfile}></img>
                    {openProfile && (
                        <div className="absolute left-[25%] top-[2%] transition  md:left-[10%] md:top-[6%] mt-2 w-48 z-10 bg-white border rounded shadow-lg">
                            <button
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                                onClick={profile}
                            >
                                Profile
                            </button>
                            <button
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                                onClick={()=>auth.signOut()}
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    <img src={Edit} alt="" className=' h-7 m-1 hidden md:block' />
                </div>

            </div>
            {/*                       search                          */}
            <div className='flex w-full h-6 justify-evenly mt-3 mb-10'>
                <div className='flex w-3/4 bg-gray-800 rounded-full border-2 border-gray-800 h-6 md:h-8'>
                    <img src={Search} alt=""
                        className='md:h-5 h-4 mx-2 mt-1 '
                    />
                    <input
                        className='w-full  bg-gray-800 text-white p-2 border-none rounded-full'
                        type="text"
                    />
                </div>

                <button className='md:h-8 p-1 rounded-md transition bg-gray-800'
                    onClick={addHandle}>
                    {
                        add ? <img src={Minus} alt="" className='h-4 md:h-5' /> : <img src={Plus} alt="" className='md:h-5 h-4' />
                    }
                </button>
            </div>
            {/*                               chat member                                  */}
            {chats.map((chat) => (
                <div onClick={() => handleSelect(chat)}
                    style={{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5183fe"
                    }}
                    key={chat.chatId} className=' flex w-full h-16 border-b-2 mt-2 
                     border-b-gray-700 '>
                    <div className='h-11 ml-3 '>
                        <img src={chat.user.avatar || Avatar} alt="avatar" className=' rounded-3xl  h-12 w-12' />
                    </div>
                    <div className='ml-2 mt-2 text-black font-sans'>
                        <h4 className='font-semibold'>{chat.user.name}</h4>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addUser && <AddUser />}
        </div>

    );
}

export default Chat;