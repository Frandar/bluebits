import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'orders-thank-you',
    templateUrl: './thank-you.component.html',
    styles: []
})
export class ThankYouComponent implements OnInit {
    constructor(
        private ordersService: OrdersService,
        private messageService: MessageService,
        private cartService: CartService
    ) {}

    ngOnInit(): void {
        const orderData = this.ordersService.getCachedOrderData();
        console.log(orderData);

        this.ordersService.createOrder(orderData).subscribe({
            next: () => {
                this.cartService.emptyCart();
                this.ordersService.removeCachedOrderData();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Order failed to be created'
                });
            }
        });
    }
}
