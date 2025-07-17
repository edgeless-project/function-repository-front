import Head from 'next/head';

interface HeaderProps {
	title: string;
};

export default function Header({ title }: HeaderProps) {
	return (
		<Head>
			<title>{title && `${title} -`} EDGELESS Function Repository</title>
			<meta name="description" content='Front-end app for the EDGELESS Function Repository'/>
		</Head>
	);
}