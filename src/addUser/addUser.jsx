import React, { useState } from "react";
import Avatar from './avatar.png'
import { arrayUnion, collection ,doc,getDocs,query,serverTimestamp,setDoc,updateDoc,where} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useUserStore } from "../firebase/userStore";
export default function AddUser(){
    const {currentUser} = useUserStore();
    const [user,setUser] = useState(null);

            const handleSearch = async (e)=>{
                e.preventDefault();
                const fromData = new FormData(e.target);
                const name = fromData.get("name");

                try {
                    const userRef = collection(db,"users");
                    //create a query against the collection
                    const q = query(userRef, where("name","==",name));

                    const querySnapShot = await getDocs(q)
                    if(!querySnapShot.empty){
                        setUser(querySnapShot.docs[0].data())
                    }
                } catch (error) {
                    console.error(error);
                }
            }

                const handleAdd = async() => {
                    const chatRef = collection(db,"chats");
                    const userChatsRef = collection(db,"userchat");
                    try {
                        console.log(chatRef);
                        const newChatRef = doc(chatRef);
                        console.log(newChatRef);
                        await setDoc(newChatRef ,{
                          createdAt:serverTimestamp(),
                          messages:[],
                        });
                        console.log(newChatRef.id);
                        await updateDoc(doc(userChatsRef,user.id),{
                            chats:arrayUnion({
                                chatId: newChatRef.id,
                                lastMessage: "",
                                receiverId:currentUser.id,
                                updateAt: Date.now(),
                            }),
                        });
                        await updateDoc(doc(userChatsRef,currentUser.id),{
                            chats:arrayUnion({
                                chatId : newChatRef.id,
                                lastMessage: "",
                                receiverId:user.id,
                                updateAt: Date.now(),
                            }),
                        }
                        )

                    } catch (error) {
                        console.error(error);
                    }
                }
            
    return(
        <>
        <div className=" absolute left-[12%] bottom-[50%] md:bottom-[35%]  md:left-[45%] md:z-10 z-10  h-38 
         md:h-56  flex flex-col justify-center items-center p-3 bg-slate-500 rounded-md backdrop-blur-md">
            <form onSubmit={handleSearch}>
                <input type="text"
                name="name"
                className="m-1 p-1 rounded-md" />
                <button className="bg-blue-600 m-1 p-1 rounded-md text-white">Search</button>
            </form>

          {user && 
            <div className="font-sans flex justify-between w-full mt-1">
               <div className="  flex  justify-center">
                <img src={user.avatar || Avatar} alt="" className="md:h-16 md:w-22 h-12 w-14 m-1 rounded-full" />
                <span className="text-white m-1">{user.name}</span>
                </div> 
                <button onClick={handleAdd} className="m-1 p-1 h-8 text-white rounded-md  bg-blue-500 ">Add User</button>
            </div>}
        </div>
        
        </>
    );
}