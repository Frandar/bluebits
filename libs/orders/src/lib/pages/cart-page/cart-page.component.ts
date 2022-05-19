import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartItemDetailed } from '../../models/cart';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'orders-cart-page',
    templateUrl: './cart-page.component.html',
    styles: []
})
export class CartPageComponent implements OnInit, OnDestroy {
    private readonly endsubs$: Subject<void> = new Subject();
    cartItemsDetailed: CartItemDetailed[] = [];
    cartCount = 0;
    constructor(
        private router: Router,
        private cartService: CartService,
        private orderService: OrdersService
    ) {}

    ngOnInit(): void {
        this._getCartDetails();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    private _getCartDetails() {
        this.cartService.cart$.pipe(takeUntil(this.endsubs$)).subscribe((respCart) => {
            this.cartItemsDetailed = [];
            this.cartCount = respCart.items?.length ?? 0;
            respCart.items?.forEach((cartItem) => {
                this.orderService.getProduct(cartItem.productId).subscribe({
                    next: (resProduct) => {
                        this.cartItemsDetailed.push({
                            product: resProduct,
                            quantity: cartItem.quantity
                        });
                    }
                });
            });
        });
    }

    backToShop() {
        this.router.navigate(['/products']);
    }

    deleteCartItem(cartItem: CartItemDetailed) {
        this.cartService.deleteCartItem(cartItem.product.id);
    }

    updateCartItemQuantity(event, cartItem: CartItemDetailed) {
        this.cartService.setCartItem(
            {
                productId: cartItem.product.id,
                quantity: event.value
            },
            true
        );
    }
}
