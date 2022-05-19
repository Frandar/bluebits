import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { UsersService } from '@bluebits/users';
import { OrderItem } from '../../models/order-item';
import { Order } from '../../models/order';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../models/cart';
import { OrdersService } from '../../services/orders.service';
import { ORDER_STATUS } from '../../order.constants';

@Component({
    selector: 'orders-checkout-page',
    templateUrl: './checkout-page.component.html',
    styles: []
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
    checkoutFormGroup: FormGroup;
    isSubmitted = false;
    orderItems: OrderItem[] = [];
    userId: string;
    countries = [];
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private messageService: MessageService,
        private location: Location,
        private cartService: CartService,
        private ordersService: OrdersService
    ) {}

    ngOnInit(): void {
        this._initCheckoutForm();
        this._autoFillUserData();
        this._getCartItems();
        this._getCountries();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    backToCart() {
        this.router.navigate(['/cart']);
    }

    private _initCheckoutForm() {
        this.checkoutFormGroup = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            street: ['', Validators.required],
            apartment: ['', Validators.required],
            zip: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required]
        });
    }

    private _getCartItems() {
        const cart: Cart = this.cartService.getCart();
        this.orderItems = cart.items?.map((item) => {
            return {
                product: item.productId,
                quantity: item.quantity
            };
        });
    }

    placeOrder() {
        this.isSubmitted = true;
        if (this.checkoutFormGroup.invalid) {
            return;
        }

        const order: Order = {
            orderItems: this.orderItems,
            shippingAddress1: this.checkoutForm.street.value,
            shippingAddress2: this.checkoutForm.apartment.value,
            city: this.checkoutForm.city.value,
            zip: this.checkoutForm.zip.value,
            country: this.checkoutForm.country.value,
            phone: this.checkoutForm.phone.value,
            status: Object.keys(ORDER_STATUS)[0],
            user: this.userId,
            dateOrdered: `${Date.now()}`
        };

        this.ordersService.cacheOrderData(order);

        this.ordersService.createCheckoutSession(this.orderItems).subscribe((error) => {
            if (error) {
                console.log('error in redirect to payment', error);
            }
        });
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();
    }

    onCancel() {
        this.location.back();
    }

    get checkoutForm() {
        return this.checkoutFormGroup.controls;
    }

    private _autoFillUserData() {
        this.usersService
            .observeCurrentUser()
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (user) => {
                    if (user) {
                        this.userId = user.id;
                        this.checkoutForm.name.setValue(user?.name);
                        this.checkoutForm.email.setValue(user?.email);
                        this.checkoutForm.phone.setValue(user?.phone);
                        this.checkoutForm.city.setValue(user?.city);
                        this.checkoutForm.country.setValue(user?.country);
                        this.checkoutForm.zip.setValue(user?.zip);
                        this.checkoutForm.apartment.setValue(user?.apartment);
                        this.checkoutForm.street.setValue(user?.street);
                    }
                }
            });
    }
}
