import { NextRequest, NextResponse } from 'next/server';
import {cookies} from "next/headers";

const publicRoutes = ['/auth/signin']

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname
	const isPublicRoute = publicRoutes.includes(path)
	const session = cookies().get('next-auth.session-token')?.value

	if (!isPublicRoute && !session && !req.nextUrl.pathname.startsWith('/auth/')) {
		return NextResponse.redirect(new URL('/auth/signin', req.nextUrl))
	}

	if (
		isPublicRoute &&
		session &&
		req.nextUrl.pathname.startsWith('/auth/')
	) {
		return NextResponse.redirect(new URL('/', req.nextUrl))
	}

	return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.svg$).*)'],
}