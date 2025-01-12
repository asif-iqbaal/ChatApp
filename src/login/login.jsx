import React, { useState } from 'react'
import Avatar from './avatar.png'
import { toast } from 'react-toastify';
import { auth, db } from '../firebase/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"
import Upload from '../firebase/upload';


function Login() {
    const [hide, setHide] = useState(false);
    const [loading, setLoadin] = useState(false);
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })
    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoadin(true);
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);


        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        } finally {
            setLoadin(false);
            window.location.reload();

        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoadin(true);
        const formData = new FormData(e.target);
        const { name, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = await Upload(avatar.file)
            await setDoc(doc(db, "users", res.user.uid), {
                name,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            });
            await setDoc(doc(db, "userchat", res.user.uid), {
                chat: []
            });
            if (res) {
                toast.success("now login and proceed ")
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message)
        } finally {
            setLoadin(false);
            window.location.reload();

        }
    }

    const handleSignup = () => {
        setHide((prev) => !prev);
    }
    return (
        <>
            <div className=" w-screen h-screen flex  justify-center items-center">
                {!hide &&
                 <div className=" w-full md:w-1/2 h-[80vh]  md:m-9 md:rounded-[78px]  md:bg-[#f5f5f5] md:shadow-[34px_34px_69px_#626262,-34px_-34px_69px_#ffffff]">

                    <div className="   flex justify-center items-center h-full ">

                        <form onSubmit={handleLogin} className="  w-2/3 flex flex-col ">
                            <p>if dont have an account ? <button className='text-blue-600' onClick={handleSignup}>SignUp</button></p>
                            <label className="text-2xl m-2 font-semibold">Email</label>
                            <input
                                className="m-1 p-2 border-gray-700 w-full bg-slate-200"
                                type="text"
                                placeholder="enter email"
                                name='email'

                                required
                            />
                            <label className="text-2xl  m-2  font-semibold">Password</label>
                            <input
                                className="m-1 p-2 border-gray-700 w-full  bg-slate-200"
                                type="text"
                                placeholder="enter email"
                                name='password'

                                required
                            />
                            <div className="text-center m-2">
                                <button disabled={loading}
                                    className="bg-black text-white m-1 p-2 w-full rounded-sm">{loading ? "Loaing..." : "Submit"}</button>
                            </div>
                        </form>
                    </div>
                </div>}
                {/*                                         register                          */}
                {hide && 
                <div className="w-full md:w-1/2 ">
                    <div className=" w-full flex justify-center items-center md:rounded-[78px]  md:bg-[#f5f5f5] md:shadow-[34px_34px_69px_#626262,-34px_-34px_69px_#ffffff]">
                        <form onSubmit={handleRegister} className="  w-2/3 flex flex-col m-3">
                            <label htmlFor="file">
                                <img src={avatar.url || Avatar} alt="" className='md:h-24 md:w-28' />
                                Upload an  image</label>
                            <input type="file" id='file' onChange={handleAvatar} style={{ display: "none" }} />
                            <label className="text-2xl m-2 font-semibold">UserName</label>
                            <input
                                className="m-1 p-2 border-gray-700 w-full bg-slate-200"
                                type="text"
                                placeholder="Name"
                                name='name'

                                required
                            />

                            <label className="text-2xl m-2 font-semibold">Email</label>
                            <input
                                className="m-1 p-2 border-gray-700 w-full bg-slate-200"
                                type="text"
                                placeholder="enter email"
                                name='email'

                                required
                            />
                            <label className="text-2xl  m-2  font-semibold">Password</label>
                            <input
                                className="m-1 p-2 border-gray-700 w-full bg-slate-200"
                                type="text"
                                placeholder="enter email"
                                name='password'

                                required
                            />
                            <div className="text-center m-2">
                                <button disabled={loading}
                                    className="bg-black text-white m-1 p-2 w-full rounded-sm">{loading ? "Loaing..." : "Submit"}</button>
                            </div>
                        </form>
                    </div>
                </div>}
            </div>
        </>
    );
}
export default Login;