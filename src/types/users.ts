import {User} from "@/types/account";

export interface ApiResponseGetUsers {
	items: UserCompleteData[];
	total: number;
	limit: number;
	offset: number;
}

export interface ApiResponseUser extends UserCompleteData{}

export interface UserCompleteData extends User {
	createdAt: string;
	updatedAt: string;
}

export interface UserDTO extends User {
	password: string;
}

export interface ResponseDeleteUserDto {
	count: number;
}

