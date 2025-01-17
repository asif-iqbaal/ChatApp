import React, { useEffect, useState } from 'react';
import Avatar from './avatar.png';
import Edit from './edit.png';
import More from './more.png';
import Search from './search.png';
import Plus from './plus.png';
import Minus from './minus.png';
import { auth } from '../firebase/firebase';
import AddUser from '../addUser/addUser';
import { useUserStore } from '../firebase/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useChatStore } from '../firebase/chatStore';
import { useNavigate } from 'react-router-dom';
import {LucideLoaderPinwheel} from 'lucide-react';
import { useWindowSize } from 'react-use';
import {Trash} from 'lucide-react'
import { toast } from 'react-toastify';

function Chat() {
  // Responsive handling for screen sizes
  const { width } = useWindowSize();
  const isLargeScreen = width > 768;

  // State management
  const { currentUser, isLoading } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  const [openProfile, setOpenProfile] = useState(false);
  const [chats, setChats] = useState([]);
  const [add, setAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addUser, setAddUser] = useState(false);

  const navigate = useNavigate();

  // Function to toggle Add User modal
  const addHandle = () => {
    setAdd((prev) => !prev);
    setAddUser((prev) => !prev);
  };

  // Loading state handling
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500); // Simulates loading

  //   return () => clearTimeout(timer); // Cleanup timer
  // }, []);

  // Fetch user chats
  useEffect(() => {
    if (!currentUser.id) return;

    const unSub = onSnapshot(doc(db, 'userchat', currentUser.id), async (res) => {
      const data = res.data();

      if (data) {
        const items = Array.isArray(data.chats) ? data.chats : [];
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, 'users', item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        setLoading(false);
      } else {
        setChats([]);
        setLoading(false);
      }
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  // Function to handle chat selection
  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, 'userchat', currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });

      changeChat(chat.chatId, chat.user);
      if (!isLargeScreen) {
        navigate('/chat');
      }
     
    } catch (error) {
      toast.error("User deletion failed")
    }
  };

  // Function to handle chat deletion
const HandleDelete = async (id) => {
    if (!currentUser.id) return;
  
    try {
      // Get the current user's chats
      const userChatsRef = doc(db, 'userchat', currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);
  
      if (userChatsSnap.exists()) {
        const userChatsData = userChatsSnap.data().chats || [];
  
        // Filter out the chat to be deleted
        const updatedChats = userChatsData.filter((chat) => chat.chatId !== id);
  
        // Update the Firestore document with the remaining chats
        await updateDoc(userChatsRef, { chats: updatedChats });
  
        // Update the local state
        setChats(updatedChats);
        toast.dismiss("User deleted")
      }
    } catch (error) {
      toast.error('Error deleting chat:', error);
      console.log("delete error",error);
    }
  };
  
  // Profile handling
  const handleProfile = () => {
    setOpenProfile((prev) => !prev);
  };

  const profile = () => {
    navigate('/profile');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <LucideLoaderPinwheel />
      </div>
    );
  }

  // Main component render
  return (
    <div className={`w-full md:w-1/4 h-screen bg-[#edf6f9] overflow-y-scroll hide-scrollbar border-r-2 border-gray-700 transition-transform`}>
      {/* Header */}
      <div className="flex justify-between w-full p-3 h-[10vh] bg-gradient-to-br from-blue-500 to-indigo-900">
        <div className="flex items-center">
          <img src={currentUser.avatar || Avatar} alt="Avatar" className="h-9 md:h-full w-8 md:w-12 rounded-full" />
          <h3 className="m-2 text-white font-serif font-bold">{currentUser.name}</h3>
        </div>
        <div className="flex items-center">
          <img src={More} alt="More" className="h-4 md:h-6 m-2 cursor-pointer" onClick={handleProfile} />
          {openProfile && (
            <div className="absolute left-[25%] top-[2%] md:left-[10%] md:top-[6%] mt-2 w-48 z-10 bg-white border rounded shadow-lg">
              <button className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left" onClick={profile}>
                Profile
              </button>
              <button className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left" onClick={() => auth.signOut()}>
                Logout
              </button>
            </div>
          )}
          <img src={Edit} alt="Edit" className="h-7 m-1 hidden md:block" />
        </div>
      </div>

      {/* Search bar */}
      <div className="flex w-full h-6 justify-evenly mt-3 mb-10">
        <div className="flex w-3/4 bg-gray-800 rounded-full border-2 border-gray-800 h-6 md:h-8">
          <img src={Search} alt="Search" className="md:h-5 h-4 mx-2 mt-1" />
          <input className="w-full bg-gray-800 text-white p-2 border-none rounded-full" type="text" placeholder="Search" />
        </div>
        <button className="md:h-8 p-1 rounded-md transition bg-gray-800" onClick={addHandle}>
          {add ? <img src={Minus} alt="Minus" className="h-4 md:h-5" /> : <img src={Plus} alt="Plus" className="md:h-5 h-4" />}
        </button>
      </div>

      {/* Chat members */}
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          className={`flex w-full h-16 hover:bg-blue-100 border-b-2 mt-2 border-gray-700 justify-between cursor-pointer ${
            chat?.isSeen ? 'bg-transparent' : 'bg-blue-500'
          }`}
          
        >
            <div className='flex w-[80%]' onClick={() => handleSelect(chat)}>
          <img src={chat?.user?.avatar || Avatar} alt="Avatar" className="rounded-full h-12 w-12 ml-3" />
          <div className="ml-2 mt-2 text-black">
            <h4 className="font-semibold">{chat?.user?.name}</h4>
            <p>{chat?.lastMessage}</p>
          </div>
          </div>
          <div className='flex justify-center items-center hover:text-red-600' ><Trash  onClick={() => HandleDelete(chat?.chatId)} /></div>
        </div>
      ))}

      {addUser && <AddUser />}
    </div>
  );
}

export default Chat;
