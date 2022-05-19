import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UsersService } from '@bluebits/users';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-users-list',
    templateUrl: './users-list.component.html',
    styles: []
})
export class UsersListComponent implements OnInit, OnDestroy {
    users: User[] = [];
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private usersService: UsersService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this._getUsers();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    deleteUser(userId: string) {
        this.confirmationService.confirm({
            message: 'Do you want to delete this User?',
            header: 'Delete User',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usersService
                    .deleteUser(userId)
                    .pipe(takeUntil(this.endsubs$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'User is deleted!'
                            });
                            this._getUsers();
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'User is not deleted!'
                            });
                        }
                    });
            }
        });
    }

    codeToCountry(countryCode: string) {
        if (countryCode) {
            return this.usersService.getCountry(countryCode);
        }
    }

    private _getUsers() {
        this.usersService
            .getUsers()
            .pipe(takeUntil(this.endsubs$))
            .subscribe((users) => {
                this.users = users;
            });
    }

    updateUser(userId: string) {
        this.router.navigateByUrl(`users/form/${userId}`);
    }
}
