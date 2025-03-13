import { setSessionAccessToken } from '@/features/account/sessionSlice';
import { getSession, signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { useDispatch } from "react-redux";

/*
    * TODO: Implement the Signin page properly.
*/

const Signin: React.FC = () => {

    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl: '/',
        });

        if (res?.url) {
            const session = await getSession();
            dispatch(setSessionAccessToken(session?.accessToken as string));
          }
        
    };

    return (
        <div>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={handleEmailChange} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={handlePasswordChange} />
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default Signin; 