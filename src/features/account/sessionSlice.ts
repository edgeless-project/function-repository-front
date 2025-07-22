import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppState} from "@/app/store";


export interface SessionSlice {
	accessToken: string;
}

const initialState: SessionSlice = {
	accessToken: ''
};

export const sessionSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		setSessionAccessToken: (state: SessionSlice, action: PayloadAction<string>) => {
			state.accessToken = action.payload || '';
		}
	}
});

export const { setSessionAccessToken } = sessionSlice.actions;

export const selectSessionAccessToken = (state: AppState) => state.session.accessToken;

export default sessionSlice.reducer;
