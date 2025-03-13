import NextAuth, {User} from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import {undefined} from "zod";

const jwtRefreshWindow = Number(process.env.NEXT_PUBLIC_JWT_REFRESH_WINDOW);
const sessionMaxAge = Number(process.env.SESSION_MAX_AGE);

const refreshAccessToken = async (accessToken: string, refreshToken: string) => {

	/*const refreshData = await fetchRefreshToken(accessToken, refreshToken);

	if(refreshData.error) {
		return null;
	}

	if(refreshData.accessToken || refreshData.refreshToken) {
		return refreshData;
	}*/

	return null;

};

export default NextAuth({
	// Configure one or more authentication providers
	providers: [
		CredentialsProvider({
			name: 'worldline-mock-api',
			credentials: {
				email: {
					label: 'email',
					type: 'email',
					placeholder: 'email',
				},
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {

				/*const loginData = await login(credentials.email, credentials.password);

				if (!loginData.accessToken) {
					return null;
				}

				const userData = await fetchUserLogged(loginData.accessToken.token);

				if(!userData.email) {
					throw new Error('User not found');
				}*/

				const user: User = {
					id: "",
					image: "",
					name: "HiPear",
					email: "nextUsr"
				};

				return user;
			},
		}),
		// ...add more providers here
	],
	session: {
		maxAge: sessionMaxAge
	},
	callbacks: {
		async jwt({ token, user, account }) {

			/*// Persist the OAuth access_token to the token right after signin

			if(account && user) {
				token.expiresAt = user.expiresAt;
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.language = user.language;
				token.darkMode = user.darkMode;
			}

			if(token?.accessToken) {
				const accessTokenDate = new Date(token.expiresAt as string);
				if( accessTokenDate.getTime() - Date.now() < jwtRefreshWindow ) {
					const newToken = await refreshAccessToken(token.accessToken as string, token.refreshToken as string);
					if(newToken) {
						if(newToken.accessToken) {
							token.accessToken = newToken.accessToken.token;
							token.expiresAt = newToken.accessToken.expiresAt;
						}
						if(newToken.refreshToken) {
							token.refreshToken = newToken.refreshToken.token;
						}
					} else {
						return null;
					}
				}
			}*/
			return token;
		},
		async session({ session, token, user }) {
			// Send properties to the client, like an access_token from a provider.
			session.expires = token.sub || "";
			session.user = {
				name: "HiApple",
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
	theme: {
		logo: "/assets/logo/copaeurope-logo.jpeg",
		colorScheme: "auto"
	}
});