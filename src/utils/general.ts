export const splitOutputs = (input: string): string[] => {
	if (!input.trim()) {
		return [];
	}

	return input.split(',').map(s => s.trim());
}

export const hasMiddleSpaces = (str: string): boolean => {
	// This regex looks for spaces between words, ignoring spaces at the start and end
	const regex = /(?<=\S)\s+(?=\S)/;
	return regex.test(str);
}