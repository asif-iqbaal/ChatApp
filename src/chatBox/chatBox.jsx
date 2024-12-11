import React, { useEffect, useRef, useState } from 'react';
import Avatar from './avatar.png';
import Call from './phone.png';
import Info from './info.png';
import Mic from './mic.png';
import Img from './img.png';
import Emoji from './emoji.png';
import Camera from './camera.png';
import Video from './video.png';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useChatStore } from '../firebase/chatStore';
import { useUserStore } from '../firebase/userStore';
import Upload from '../firebase/upload';
import { useNavigate } from 'react-router-dom';
import Back from './back.png';
import { useWindowSize } from 'react-use';

function ChatBox() {
    const { width } = useWindowSize();
    const isLargeScreen = width > 768;
    const [chat, setChat] = useState();
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [emoji, setEmoji] = useState(false);
    const [users, setUsers] = useState([]);
    const [img, setImg] = useState({
        file: null,
        url: "",
    });

    const { chatId, user } = useChatStore();
    const { currentUser } = useUserStore();
    const endRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setUsers([user]);
        }
    }, [user]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });
        return () => unSub();
    }, [chatId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages, img.url]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        if (text === "" && img.file === null) return;

        let imgUrl = null;

        try {
            if (img.file) {
                setLoading(true);
                imgUrl = await Upload(img.file);
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchat", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    if (chatIndex > -1) {
                        userChatsData.chats[chatIndex].lastMessage = text;
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        });
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }

        setImg({
            file: null,
            url: "",
        });
        setText("");
        setLoading(false);
    };

    const handleNavigate = () => {
        navigate('/');
    };

    return (
        <div className='w-full md:w-3/4 h-screen border-r-2 border-r-gray-700 bg-[#edf6f9] relative transition-transform'>
            <div className='flex md:h-[10vh] h-[10vh] md:justify-between w-full md:w-full bg-[#006d77] border-b-black fixed top-0  border-r-2 border-gray-700'>
                {!isLargeScreen && (
                    <button className='text-white' onClick={handleNavigate}>
                        <img src={Back} alt="back" className='ml-2 h-4 w-6 md:h-8 md:w-10' />
                    </button>
                )}
                {users.map((message) => (
                    <div className='w-2/3 flex md:h-12 md:m-4 md:my-3 my-1' key={message.id}>
                        <img src={message.avatar} alt="img" className='h-16 md:h-12 md:w-12 w-14 p-1 py-[10px] md:p-0 rounded-full' />
                        <h3 className='m-2 text-white font-sans font-semibold'>{message.name}</h3>
                    </div>
                ))}
                <div className='md:w-1/3 flex justify-center items-center'>
                    {/* <img src={Call} alt=""  className=' h-4 md:h-5 m-2'/>
                    <img src={Video} alt="" className=' h-4 md:h-6 m-2' />
                    <img src={Info} alt="" className=' h-4 md:h-6 m-1 md:m-2' /> */}
                </div>
            </div>
            <div className='md:h-[80vh] h-[70vh] md:mt-[10vh] mt-[20vh] overflow-y-scroll hide-scrollbar border-gray-700'>
                {chat?.messages?.map((message) => {
                    if (message.createAt) {
                        const { seconds, nanoseconds } = message.createAt;
                        const date = new Date(seconds * 1000 + nanoseconds / 1000000);
                        const formattedDate = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

                        return (
                            <div className='flex flex-col px-10' key={message.id || Math.random()}>
                                {message.senderId === currentUser.id ? (
                                    <div className='flex w-full justify-end mt-2'>
                                        <div>
                                            <p className='text-white md:mx-2 md:p-3 mx-1 p-2 bg-[#468189] rounded-md'>
                                                {message.img ? <img src={message.img} className='h-auto w-52' /> : message.text}
                                            </p>
                                            <span className='text-black text-sm'>{formattedDate}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex w-full mt-2'>
                                        <div>
                                            <p className='text-white md:mx-2 md:p-3 mx-1 p-2 bg-[#1b2021] rounded-md'>
                                                {message.img ? <img src={message.img} className='h-auto w-52' /> : message.text}
                                            </p>
                                            <span className='text-black text-sm'>{formattedDate}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
                {img.url && (
                    <div>
                        <img src={img.url} alt="" className='h-[350px] w-1/2 p-4' />
                    </div>
                )}
                <div ref={endRef}></div>
            </div>
            <div className='flex md:h-[10vh] h-[10vh] w-full justify-between bg-[#1b2021] items-center border-t-2 border-gray-800'>
                <div className='md:flex md:w-1/5 justify-center items-center'>
                    <label htmlFor="file">
                        <img src={Img} alt="img" className='h-5 m-2' />
                    </label>
                    <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
                    <img src={Camera} alt="img" className='h-5 m-2 hidden md:block' />
                    <img src={Mic} alt="img" className='h-5 m-2 hidden md:block' />
                </div>
                <div className='flex justify-center items-center md:w-4/5 w-4/6'>
                    <input
                        type="text"
                        placeholder='type message'
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className='ml-3 w-full md:h-10 h-7 rounded-lg p-3'
                    />
                </div>
                <div className='flex w-2/5 justify-evenly items-center'>
                    <div>
                        <img src={Emoji} alt="img" className='relative md:h-5 md:m-2 h-4' onClick={() => setEmoji((prev) => !prev)} />
                        <div className='absolute bottom-32 md:right-8 right-4'>
                            <EmojiPicker open={emoji} onEmojiClick={handleEmoji} className='h-8 w-6' />
                        </div>
                    </div>
                    {loading ? (
                        <button
                            onClick={handleSend}
                            className='bg-green-700 md:w-1/2 w-2/4 p-1 text-white rounded-md'
                        >
                            wait...
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            className='bg-blue-700 md:w-1/2 w-2/4 p-1 text-white rounded-md'
                        >
                            Send
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatBox;
