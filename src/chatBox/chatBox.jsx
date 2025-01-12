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
        <div className="bg-[#edf6f9] h-screen md:w-3/4 relative">
            {/* Header */}
            <div className="bg-[#006d77] flex items-center px-4 py-3 border-b border-gray-700 fixed w-full md:w-3/4">
                {!isLargeScreen && (
                    <button onClick={handleNavigate}>
                        <img src={Back} alt="Back" className="h-8 w-8" />
                    </button>
                )}
                <div className="flex items-center ml-4 space-x-3">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center space-x-2">
                            <img src={user.avatar || Avatar} alt="Avatar" className="h-12 w-12 rounded-full" />
                            <span className="text-white font-medium">{user.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[85vh] w-screen md:w-auto md:h-[calc(100vh-140px)] overflow-y-auto p-4">
                {chat?.messages?.map((msg, index) => (
                    <div key={index} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : ''} mb-4`}>
                        <div className={`bg-[#468189] text-white p-3 rounded-md max-w-xs ${msg.senderId === currentUser.id ? 'bg-blue-500' : 'bg-gray-700'}`}>
                            {msg.img ? <img src={msg.img} alt="Image" className="w-full rounded-md" /> : msg.text}
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>

            {/* Message Input */}
            <div className="bg-[#1b2021] fixed bottom-0 w-full md:w-3/4 flex items-center px-4 py-2 space-x-2 border-t border-gray-800">
                <label htmlFor="file" className="cursor-pointer">
                    <img src={Img} alt="Upload" className="h-6 w-6" />
                </label>
                <input type="file" id="file" onChange={handleImg} className="hidden" />
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg outline-none"
                />
                <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default ChatBox;
