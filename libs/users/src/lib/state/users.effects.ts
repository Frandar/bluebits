import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';
import { UsersService } from '../services/users.service';

import * as UsersActions from './users.actions';

@Injectable()
export class UsersEffects {
    buildUserSession$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.buildUserSession),
            concatMap(() => {
                if (this.localstorageService.isValidToken()) {
                    const userId = this.localstorageService.getUserIdFromToken();
                    if (userId) {
                        return this.usersService.getUser(userId).pipe(
                            map((user) => {
                                return UsersActions.buildUserSessionSuccess({ user: user });
                            }),
                            catchError(() => of(UsersActions.buildUserSessionFailed()))
                        );
                    } else {
                        return of(UsersActions.buildUserSessionFailed());
                    }
                } else {
                    return of(UsersActions.buildUserSessionFailed());
                }
            })
        )
    );

    constructor(
        private readonly actions$: Actions,
        private localstorageService: LocalStorageService,
        private usersService: UsersService
    ) {}
}
