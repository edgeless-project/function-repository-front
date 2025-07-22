
export interface ResponseApikeyDto{
	id?: string;
	key: string;
	name?: string;
	createdAt?: Date;
	owner?: string;
	role?: string;
}

export interface ResponseListApikeyDto{
	items:  ResponseApikeyDto[];
	total: number;
	limit: number;
	offset: number;
}

export interface ResponseDeleteKeyDto{
	elementsDeleted: number;
}