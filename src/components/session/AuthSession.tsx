import {useDispatch} from "react-redux";
import {useSession, getSession} from "next-auth/react";
import {setSessionAccessToken} from "@/features/account/sessionSlice";
import {getUser} from "@/features/account/accountSlice";
import {ReactNode, useEffect} from "react";
import { useRouter } from 'next/router';

const jwtRefreshWindow = Number(process.env.NEXT_PUBLIC_JWT_REFRESH_WINDOW);

type Props = {
	children?: ReactNode;
};

const AuthSession = ({children}: Props) => {

	const { data: session, status } = useSession();
	const dispatch = useDispatch();
	const router = useRouter();

	if(session?.accessToken) {
		dispatch(setSessionAccessToken(session.accessToken as string));
		dispatch(getUser() as any);
	}

	useEffect(() => {
		if (!session && status !== "loading") {
			router.push("/auth/signin").then();
		} else if(session) {
			const expDate = new Date(Number(session.expires));
			const refreshTimeout = expDate.getTime() - Date.now() - jwtRefreshWindow;
			const tokenRefresher = setTimeout(() => {
				getSession();
			}, refreshTimeout);
			return () => {
				clearTimeout(tokenRefresher);
			};
		}
	}, [router, session, status]);

	return children;

};

export default AuthSession;