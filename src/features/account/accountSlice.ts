import { AppState } from "@/app/store";
import { createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "@/types/account";
import { fetchUserLogged } from "./accountServices";


export interface AccountSlice {
	user: string;
	role: string;
};

const initialState: AccountSlice = {
	user: "",
	role: "",
};

export const getUser = createAsyncThunk(
		'account/getUser',
		async (arg, { getState }) => {
			const state = getState() as AppState;
			const user: User = await fetchUserLogged(state.session.accessToken);
			return user;
		}
);

export const AccountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		setAccountProperties: (state: AccountSlice, action: PayloadAction<AccountSlice>) => {
			state.user = action.payload.user;
			state.role = action.payload.role;
		},
		setUserName: (state: AccountSlice, action: PayloadAction<string>) => {
			state.user = action.payload;
		},
		setUserRole: (state: AccountSlice, action: PayloadAction<string>) => {
			state.role = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(getUser.pending, (state: AccountSlice) => {}),
		builder.addCase(getUser.fulfilled, (state: AccountSlice, action: PayloadAction<User>) => {
			state.user = action.payload.email;
			state.role = action.payload.role;
		}),
		builder.addCase(getUser.rejected, (state: AccountSlice) => {})
	}
});

export const {
	setUserName,
	setUserRole,
	setAccountProperties,
} = AccountSlice.actions;

export const selectUser = (state: AppState) => state.account.user;
export const selectRole = (state: AppState) => state.account.role;

export default AccountSlice.reducer;