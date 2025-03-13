import { AppState } from "@/app/store";
import { createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "@/types/account";


export interface AccountSlice {
	user: string;
	role: string;
	token: string;
};

const initialState: AccountSlice = {
	user: "",
	role: "",
	token: "",
};

export const getUser = createAsyncThunk(
		'account/getUser',
		async (arg, { getState }) => {
			const state = getState() as AppState;
			const user: User = {
				accessToken: "",
				expiresAt: "",
				email: "new",
				role: "new"

			}//await fetchUserLogged(state.session.accessToken);
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
			state.token = action.payload.token || '';
		},
		setUserName: (state: AccountSlice, action: PayloadAction<string>) => {
			state.user = action.payload;
		},
		setUserRole: (state: AccountSlice, action: PayloadAction<string>) => {
			state.role = action.payload;
		},
		setUserToken: (state: AccountSlice, action: PayloadAction<string>) => {
			state.token = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getUser.pending, (state: AccountSlice) => {}),
				builder.addCase(getUser.fulfilled, (state: AccountSlice, action: PayloadAction<User>) => {
					state.user = action.payload.email;
					state.role = action.payload.role;
					state.token = action.payload.accessToken;
				}),
				builder.addCase(getUser.rejected, (state: AccountSlice) => {})
	}
});

export const {
	setUserName,
	setUserRole,
	setUserToken,
	setAccountProperties,
} = AccountSlice.actions;

export const selectUser = (state: AppState) => state.account.user;
export const selectRole = (state: AppState) => state.account.role;
export const selectToken = (state: AppState) => state.account.token;

export default AccountSlice.reducer;