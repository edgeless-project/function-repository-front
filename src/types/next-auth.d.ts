// next-auth.d.ts
// noinspection ES6UnusedImports

import NextAuth from "next-auth";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}