import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Category } from '../../models/category';
import { Product } from '../../models/product';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';

@Component({
    selector: 'products-list',
    templateUrl: './products-list.component.html',
    styles: []
})
export class ProductsListComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    categories: Category[] = [];
    isCategoryPage: boolean;
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            params.categoryid ? this._getProducts([params.categoryid]) : this._getProducts();
            params.categoryid ? (this.isCategoryPage = true) : (this.isCategoryPage = false);
        });
        this._getCategories();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    private _getProducts(categoriesFilter?: string[]) {
        this.productsService
            .getProducts(categoriesFilter)
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (products) => {
                    this.products = products;
                }
            });
    }

    private _getCategories() {
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (categories) => {
                    this.categories = categories;
                }
            });
    }

    categoryFilter() {
        const selectedCategories = this.categories
            .filter((category) => category.checked)
            .map((filteredCategory) => filteredCategory.id);
        this._getProducts(selectedCategories);
    }
}
