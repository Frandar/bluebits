import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
    selector: 'users-login',
    templateUrl: './login.component.html',
    styles: []
})
export class LoginComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    authError = false;
    authMessage = 'Email or Password is incorrect';
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private formBuilder: FormBuilder,
        private auth: AuthService,
        private localStorageService: LocalStorageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this._initLoginForm();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    private _initLoginForm() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        this.isSubmitted = true;

        if (this.form.invalid) {
            return;
        }

        this.auth
            .login(this.loginForm.email.value, this.loginForm.password.value)
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (user: User) => {
                    this.authError = false;
                    this.localStorageService.setToken(user.token);
                    this.router.navigate(['/']);
                },
                error: (error: HttpErrorResponse) => {
                    this.authError = true;
                    if (error.status !== 400) {
                        this.authMessage = 'Error in the server, please try again later!';
                    }
                }
            });
    }

    get loginForm() {
        return this.form.controls;
    }
}
