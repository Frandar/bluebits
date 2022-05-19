import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User, UsersService } from '@bluebits/users';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-users-form',
    templateUrl: './users-form.component.html',
    styles: []
})
export class UsersFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    editMode = false;
    currentUserId: string;
    countries = [];
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private messageService: MessageService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this._initUserForm();
        this._getCountries();
        this._checkEditMode();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    private _initUserForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            password: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            isAdmin: [false],
            street: [''],
            apartment: [''],
            zip: [''],
            city: [''],
            country: ['']
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const user: User = {
            id: this.currentUserId,
            name: this.userForm.name.value,
            password: this.userForm.password.value,
            email: this.userForm.email.value,
            phone: this.userForm.phone.value,
            isAdmin: this.userForm.isAdmin.value,
            street: this.userForm.street.value,
            apartment: this.userForm.apartment.value,
            zip: this.userForm.zip.value,
            city: this.userForm.city.value,
            country: this.userForm.country.value
        };
        if (this.editMode) {
            this._updateUser(user);
        } else {
            this._addUser(user);
        }
    }

    private _addUser(user: User) {
        this.usersService
            .createUser(user)
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (user: User) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `User ${user.name} is created!`
                    });

                    setTimeout(() => {
                        this.location.back();
                    }, 2000);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'User is not created'
                    });
                }
            });
    }

    private _updateUser(user: User) {
        this.usersService
            .updateUser(user)
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (user: User) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `User ${user.name} is updated!`
                    });

                    setTimeout(() => {
                        this.location.back();
                    }, 2000);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'User is not updated'
                    });
                }
            });
    }

    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
            if (params.id) {
                this.editMode = true;
                this.currentUserId = params.id;
                this.usersService
                    .getUser(params.id)
                    .pipe(takeUntil(this.endsubs$))
                    .subscribe({
                        next: (user) => {
                            this.userForm.name.setValue(user.name);
                            this.userForm.email.setValue(user.email);
                            this.userForm.isAdmin.setValue(user.isAdmin);
                            this.userForm.street.setValue(user.street);
                            this.userForm.apartment.setValue(user.apartment);
                            this.userForm.zip.setValue(user.zip);
                            this.userForm.city.setValue(user.city);
                            this.userForm.country.setValue(user.country);
                            this.userForm.password.setValidators([]);
                            this.userForm.password.updateValueAndValidity();
                            this.userForm.phone.setValue(user.phone);
                        }
                    });
            }
        });
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();
    }

    onCancel() {
        this.location.back();
    }

    get userForm() {
        return this.form.controls;
    }
}
