import React, { useState, useEffect } from "react";
import Avatar from "./avatar.png";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useUserStore } from "../firebase/userStore";
import { toast } from "react-toastify";

export default function AddUser() {
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);

  // ✅ Load chats when the component mounts
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "userchat", currentUser.id), (res) => {
      const data = res.data();
      if (data && data.chats) {
        setChats(data.chats);
      }
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  // ✅ Handle user search
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("name", "==", name));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        toast.error("User not found");
        setUser(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Handle adding a user
  const handleAdd = async () => {
    if (!user) return;

    // ✅ Check if the chat already exists
    const existingChat = chats.find((chat) => chat.receiverId === user.id);
    if (existingChat) {
      toast.info("Chat already exists");
      return;
    }

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchat");

    try {
      const newChatRef = doc(chatRef);

      // Create a new chat document
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update both users' chat lists
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      toast.success("Chat added successfully");
      setUser(null); // Clear the user after adding
    } catch (error) {
      console.error(error);
      toast.error("Failed to add chat");
    }
  };

  return (
    <div className="z-20 absolute left-1/2 bottom-1/2 transform -translate-x-1/2 translate-y-1/2 md:w-96 w-80 p-6 bg-slate-700 shadow-lg rounded-xl backdrop-blur-md">
      <form onSubmit={handleSearch} className="flex items-center justify-between mb-4">
        <input
          type="text"
          name="name"
          placeholder="Search user by name"
          className="w-full p-2 text-sm text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-500 transition-all"
        >
          Search
        </button>
      </form>

      {user && (
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-md shadow-md">
          <div className="flex items-center">
            <img
              src={user.avatar || Avatar}
              alt="User Avatar"
              className="h-12 w-12 rounded-full border-2 border-blue-500"
            />
            <span className="ml-4 text-white text-lg font-medium">{user.name}</span>
          </div>
          <button
            onClick={handleAdd}
            className="p-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-400 transition-all"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
}
