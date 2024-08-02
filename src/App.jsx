import { useEffect, useState } from 'react';
import Chat from './chat/chat';
import Profile from './profile/profile';
import ChatBox from './chatBox/chatBox';
import Loading from './loading/loading';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './login/login';
import Notification from './notification/notification';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import { useUserStore } from './firebase/userStore';
import { useChatStore } from './firebase/chatStore';
import { useWindowSize } from 'react-use';

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const { width } = useWindowSize();
  const isLargeScreen = width > 768; // You can adjust the breakpoint as needed

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      console.log("data fetch from app.jsx");
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading)
    return (
      <div className='h-screen w-screen flex justify-center items-center'>
        <Loading />
      </div>
    );

  return (
    <>
      <Router>
        <>
          {currentUser ? (
            <div className='w-screen flex h-screen bg-[#faf9f9] 
             bg-[url("https://i.pinimg.com/originals/de/d0/bb/ded0bbdd8485e424327257405a86a884.gif")]
             bg-no-repeat bg-right bg-contain'>
            
              <Routes>
                <Route path="/" element={<Chat />} />
               <Route path='/profile' element = {<Profile />}/>
                {!isLargeScreen && <Route path="/chat" element={<ChatBox />} />}
              </Routes>
             
              {isLargeScreen && chatId && <ChatBox />}
              {isLargeScreen && chatId && <Profile />}
              

              {/* {chatId && <Profile />} */}
            </div>
          ) : (
            <Login />
          )}
          <Notification />
        </>
      </Router>
    </>
  );
}

export default App;
