import {useDispatch} from "react-redux";
import {useSession, getSession} from "next-auth/react";
import {setSessionAccessToken} from "@/features/account/sessionSlice";
import {getUser} from "@/features/account/accountSlice";
import React, {useEffect} from "react";

type Props = {
	children?: React.ReactNode;
};

const AuthSession = ({children}: Props) => {

	const dispatch = useDispatch();

	const { data: session, status } = useSession();
	console.log("session", session);
	if(session?.user?.name) {
		dispatch(setSessionAccessToken(session.user.name as string));
		// @ts-ignore
		dispatch(getUser());
	}

	useEffect(() => {
		if(session) {
			const expDate = new Date(session.expires as string);
			const refreshTimeout = expDate.getTime() - Date.now();
			const tokenRefresher = setTimeout(() => {
				getSession();
			}, refreshTimeout);
			return () => {
				clearTimeout(tokenRefresher);
			};
		}
	}, [session, status]);

	return children;

};

export default AuthSession;