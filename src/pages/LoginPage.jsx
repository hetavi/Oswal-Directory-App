// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";
import { ref, get, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../firebase';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    const user = result.user;
                    console.log('✅ Google redirect sign-in successful:', user);
                    await handleUserDbOperations(user);
                    navigate('/');
                }
            } catch (err) {
                console.error('❌ Google redirect sign-in failed:', err);
                setError(err.message);
            }
        };

        handleRedirectResult();
    }, [navigate]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignUp) {
                console.log('🔵 Attempting sign-up with email/password:', email);
                const result = await createUserWithEmailAndPassword(auth, email, password);
                const user = result.user;
                console.log('✅ Sign-up successful:', user);
                // Create user record in DB for new email/password user
                await set(ref(db, `users/${user.uid}`), {
                    email: user.email,
                    name: user.displayName || '',
                    role: 'guest',
                    status: 'pending',
                });
                alert('✅ You have been registered. Awaiting committee approval.');
            } else {
                console.log('🔵 Attempting sign-in with email/password:', email);
                const result = await signInWithEmailAndPassword(auth, email, password);
                console.log('✅ Sign-in successful:', result.user);
            }
            navigate('/');
        } catch (err) {
            console.error('❌ Email/Password auth failed:', err);
            setError(err.message);
        }
    };

    const handleUserDbOperations = async (user) => {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            console.log('🆕 New Google user. Creating user record in DB');
            await set(userRef, {
                email: user.email,
                name: user.displayName || '',
                role: 'guest',
                status: 'pending',
            });
            await set(ref(db, 'member_requests/' + user.uid), {
                name: user.displayName || '',
                gmail: user.email,
                status: 'pending',
            });
            alert('✅ You have been registered. Awaiting committee approval.');
        } else {
            console.log('✅ Existing Google user found in DB');
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        console.log('🔵 Starting Google sign-in flow');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            await handleUserDbOperations(user);
            console.log('✅ Google sign-in successful with popup:', user);
            navigate('/');
        } catch (err) {
            console.error('❌ Google login failed:', err);
            // Check for popup errors and fall back to redirect
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked') {
                console.log("Popup was blocked or closed. Falling back to redirect.");
                await signInWithRedirect(auth, googleProvider);
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">{isSignUp ? 'Sign Up' : 'Login'}</h2>
            <p>
                {isSignUp ? "Already registered?" : "New here?"}{" "}
                <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: "blue", cursor: "pointer" }}>
                    {isSignUp ? "Sign In" : "Sign Up"}
                </span>
            </p>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleEmailAuth} className="space-y-4">
                <input
                    className="w-full border p-2"
                    type="email"
                    placeholder="Gmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full border p-2"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </button>
            </form>
            <div className="mt-4 text-center">
                <p className="text-sm">OR</p>
                <button
                    onClick={handleGoogleLogin}
                    className="mt-2 bg-red-500 text-white py-2 px-4 rounded"
                >
                    {isSignUp ? "Sign Up " : "Sign In "} With Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;