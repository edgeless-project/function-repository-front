import { fetchRefreshToken, fetchUserLogged, login } from "@/features/account/accountServices";
import NextAuth, {User} from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';

const jwtRefreshWindow = Number(process.env.NEXT_PUBLIC_JWT_REFRESH_WINDOW);
const sessionMaxAge = Number(process.env.SESSION_MAX_AGE);

interface CustomUser extends User {
	expiresAt?: string;
	accessToken?: string;
	refreshToken?: string;
  }

/*const refreshAccessToken = async (accessToken: string, refreshToken: string) => {

	const refreshData = await fetchRefreshToken(accessToken, refreshToken);

	if(refreshData.error) {
		return null;
	}

	if(refreshData.accessToken || refreshData.refreshToken) {
		return refreshData;
	}

	return null;

};*/

export default NextAuth({
	// Configure one or more authentication providers
	providers: [
		CredentialsProvider({
			name: 'function-repository-api',
			credentials: {
				email: {
					label: 'email',
					type: 'email',
					placeholder: 'email',
				},
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {

				const loginData = await login(credentials?.email as string, credentials?.password as string);

				if (!loginData.access_token) {
					return null;
				}

				const userData = await fetchUserLogged(loginData.access_token);

				if(!userData.email) {
					throw new Error('User not found');
				}

				const user: CustomUser = {
					id: userData.email,
					email: userData.email,
					image: '',
					//expiresAt: loginData.accessToken.expiresAt,
					accessToken: loginData.access_token,
					//refreshToken: loginData.refreshToken.token
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
		async jwt({ token, user, account }: { token: any, user?: CustomUser, account?: any }) {

			// Persist the OAuth access_token to the token right after signin

			if(account && user) {
				token.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // TODO: Change this
				token.accessToken = user.accessToken;
				//token.refreshToken = user.refreshToken;
			}

			/*if(token?.accessToken) {
				const accessTokenDate = new Date(token.expiresAt as string);
				if( accessTokenDate.getTime() - Date.now() < jwtRefreshWindow ) {
					const newToken = await refreshAccessToken(token.accessToken as string, token.refreshToken as string);
					if(newToken) {
						if(newToken.accessToken) {
							token.accessToken = newToken.accessToken;
							token.expiresAt = newToken.accessToken.expiresAt;
						}
						if(newToken.refreshToken) {
							token.refreshToken = newToken.refreshToken.token;
						}
					} else {
						return token;
					}
				}
			}*/
			return token;
		},
		async session({ session, token, user }) {
			// Send properties to the client, like an access_token from a provider.
			if(!token) {
				return { ...session, expiresAt: null, accessToken: null, firstName: null, lastName: null };
			}
			session.expires = token.expiresAt as string;
			session.accessToken = token.accessToken as string;
			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
	theme: {
		logo: "/assets/logo/***.jpeg", // TODO: Configure the logo
		colorScheme: "auto"
	}
});