import React, { useState } from 'react';
import Avatar from './avatar.png';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Upload from '../firebase/upload';

function Login() {
    const [hide, setHide] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login successful!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { name, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = avatar.file ? await Upload(avatar.file) : "";
            await setDoc(doc(db, "users", res.user.uid), {
                name,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            });
            toast.success("Registration successful! Please login.");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => setHide((prev) => !prev);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-900">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-lg">
                {!hide ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
                        <p className="text-center text-gray-500">
                            Don't have an account?{" "}
                            <button onClick={handleSignup} className="text-blue-600 hover:underline">
                                Sign Up
                            </button>
                        </p>
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                required
                                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-3 rounded-md text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} transition`}
                        >
                            {loading ? "Loading..." : "Login"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
                        <div className="flex flex-col items-center space-y-4">
                            <label htmlFor="file" className="cursor-pointer">
                                <img
                                    src={avatar.url || Avatar}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full border-2 border-gray-300 hover:border-blue-500 transition"
                                />
                                <span className="block text-gray-500 text-sm mt-2">Upload an image</span>
                            </label>
                            <input type="file" id="file" onChange={handleAvatar} className="hidden" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                required
                                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                required
                                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-3 rounded-md text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"} transition`}
                        >
                            {loading ? "Loading..." : "Sign Up"}
                        </button>
                        <p className="text-center text-gray-500">
                            Already have an account?{" "}
                            <button onClick={handleSignup} className="text-blue-600 hover:underline">
                                Back to Login
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;
