import {Action, configureStore, ThunkAction} from "@reduxjs/toolkit";
import {createWrapper} from "next-redux-wrapper";
import sessionReducer from "@/features/account/sessionSlice";
import accountReducer from "@/features/account/accountSlice";

const makeStore = () => configureStore({
	reducer: {
		session: sessionReducer,
		account: accountReducer,
	},
	devTools: true,
});

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = ReturnType<AppStore['dispatch']>;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);