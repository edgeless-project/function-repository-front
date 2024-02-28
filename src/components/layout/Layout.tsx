import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import Header from './Header';
import Sidebar from './Sidebar';


interface LayoutProps {
	children: React.ReactNode;
	title?: string;
}

export default function Layout({ children, title='' }: LayoutProps) {
	return (
		<div>
			<Header title={title}/>
			<main>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200">
              <div className="flex items-center px-4">
                <div className="mx-4 w-full px-4 py-2">{title}</div>
              </div>
              <div className="flex items-center pr-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>WD</AvatarFallback>
                </Avatar>
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