import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrdersService, ORDER_STATUS } from '@bluebits/orders';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-orders-detail',
    templateUrl: './orders-detail.component.html',
    styles: []
})
export class OrdersDetailComponent implements OnInit, OnDestroy {
    order: Order;
    orderStatuses = [];
    selectedStatus: any;
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private ordersService: OrdersService,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this._mapOrderStatus();
        this._getOrder();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    private _mapOrderStatus() {
        this.orderStatuses = Object.keys(ORDER_STATUS).map((orderKey) => {
            return {
                id: orderKey,
                name: ORDER_STATUS[orderKey].label
            };
        });
    }

    private _getOrder() {
        this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
            if (params.id) {
                this.ordersService
                    .getOrder(params.id)
                    .pipe(takeUntil(this.endsubs$))
                    .subscribe((order) => {
                        this.order = order;
                        this.selectedStatus = order.status;
                    });
            }
        });
    }

    onStatusChange(event) {
        if (event.value) {
            this.ordersService
                .updateOrder({ status: event.value }, this.order.id)
                .pipe(takeUntil(this.endsubs$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Order status is updated!'
                        });
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Order status is not updated!'
                        });
                    }
                });
        }
    }
}
