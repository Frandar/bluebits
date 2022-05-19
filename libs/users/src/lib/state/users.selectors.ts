import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState, USERS_FEATURE_KEY } from './users.reducer';

// Lookup the 'Users' feature state managed by NgRx
export const getUsersState = createFeatureSelector<UsersState>(USERS_FEATURE_KEY);

export const getUser = createSelector(getUsersState, (state: UsersState) => state.user);

export const getUserisAuth = createSelector(
    getUsersState,
    (state: UsersState) => state.isAuthenticated
);
