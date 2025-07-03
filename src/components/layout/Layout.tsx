import React, {useEffect} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from './Header';
import Sidebar from './Sidebar';
import { signOut } from "next-auth/react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useRouter} from "next/router";
import {useSelector} from "react-redux";
import {selectUser} from "@/features/account/accountSlice";
import Link from "next/link";
import {fetchUserLogged} from "@/features/account/accountServices";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";

interface LayoutProps {
	children: React.ReactNode;
	title?: string;
}

export default function Layout({ children, title='' }: LayoutProps) {
	const router = useRouter();
	const email = useSelector(selectUser);
	const tokenValue = useSelector(selectSessionAccessToken);
	const [id, setId] = React.useState<string>('');

	useEffect(() => {
		fetchUserLogged(tokenValue).then((user) => {if(user.id)setId(user.id);});
	}, []);

	const handleSingOut = async () => {
		const data = await signOut({redirect: false, callbackUrl: '/auth/signin'});
		await router.push(data.url);
	}

	return (
		<div>
			<Header title={title}/>
			<main>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center justify-between shrink-0 h-16 sticky top-0 z-50 bg-white border-b border-gray-200">
              <div className="flex items-center px-4">
                <div className="mx-4 w-full px-4 py-2">{title}</div>
              </div>
              <div className="flex items-center pr-4">
								<DropdownMenu>
									<DropdownMenuTrigger>
										<Avatar>
											<AvatarImage src="/assets/avatars/User-avatar.png"/>
											<AvatarFallback>WD</AvatarFallback>
										</Avatar>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuLabel>{email}</DropdownMenuLabel>
										<DropdownMenuSeparator/>
										<DropdownMenuItem>
											{id.length > 0 ? <Link href={`/password/change/${id}`}>
												Change Password
											</Link> :
											<span className={"text-gray-400 cursor-not-allowed"}>
												Change Password
											</span>}
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleSingOut}>Log Out</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
              </div>
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </main>
		</div>
	);
};