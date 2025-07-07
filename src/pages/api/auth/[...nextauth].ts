import { fetchRefreshToken, login } from "@/features/account/accountServices";
import NextAuth, {User} from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { signOut } from 'next-auth/react';

const jwtRefreshWindow = Number(process.env.NEXT_PUBLIC_JWT_REFRESH_WINDOW);
const sessionMaxAge = Number(process.env.SESSION_MAX_AGE);

interface CustomUser extends User {
	role?: string;
	expiresAt?: string;
	accessToken?: string;
}

const refreshAccessToken = async (accessToken: string) => {

	const refreshData = await fetchRefreshToken(accessToken);
	if(refreshData?.access_token?.token) {
		return refreshData;
	}
	return null;
};

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
				password: { label: 'Password', type: 'password', placeholder: 'password' },
			},
			async authorize(credentials, req) {

				const loginData = await login(credentials?.email as string, credentials?.password as string);

				if (!loginData.access_token.token) {
					throw new Error('Login failed. Email or password incorrect.');
				}

				const user: CustomUser = {
					id:credentials? credentials.email : "",
					email: credentials? credentials.email : "",
					expiresAt: loginData.access_token.expiresAt as string,
					accessToken: loginData.access_token.token
				};
				return user;
			},
		}),
		// ...add more providers here
	],
	session: {
		maxAge: sessionMaxAge,
	},
	callbacks: {
		async jwt({ token, user, account }: { token: any, user?: any, account?: any }) {
			// Persist the OAuth access_token to the token right after signin
			if(account && user) {
				token.expiresAt = user.expiresAt;
				token.accessToken = user.accessToken;
			}
			if(token?.accessToken) {
				const accessTokenDate = new Date(Number(token.expiresAt));
				const remainingTime = (accessTokenDate.getTime() - Date.now())
				if (remainingTime < 0) {
					await signOut({redirect: false});
					return null;
				}else if( remainingTime < jwtRefreshWindow ) {
					const newToken = await refreshAccessToken(token.accessToken as string);
					if(newToken?.access_token?.token) {
						token.accessToken = newToken.access_token.token;
						token.expiresAt = newToken.access_token.expiresAt? newToken.access_token.expiresAt : 0;
						return token;
					}
				}
			}
			return token;
		},
		async session({ session, token, user} :{ session: any, token: any, user: any }) {
			// Send properties to the client, like an access_token from a provider.
			if(!token) {
				return { ...session, expiresAt: null, accessToken: null};
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
		logo: "/assets/images/logo_edgeless_colorless.svg",
		colorScheme: "auto"
	}
});