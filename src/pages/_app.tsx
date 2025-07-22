import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'reactflow/dist/style.css'
import {Provider} from "react-redux";
import { SessionProvider } from "next-auth/react";
import {wrapper} from "@/app/store";
import AuthSession from "@/components/session/AuthSession";

export default function App({ Component, pageProps: {session, ...pageProps} }: AppProps) {
	const {store, props} = wrapper.useWrappedStore(pageProps);

	return (
		<Provider store={store}>
			<SessionProvider session={session}>
				<AuthSession>
					<Component {...props} />
				</AuthSession>
			</SessionProvider>
		</Provider>
	)
}