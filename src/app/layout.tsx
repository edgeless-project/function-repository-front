import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "EDGELESS Function Repository",
	description: "Front-end app for the EDGELESS Function Repository",
};

export default function RootLayout({
	                                   children,
                                   }: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
		<body className={inter.className}>{children}</body>
		</html>
	);
}
