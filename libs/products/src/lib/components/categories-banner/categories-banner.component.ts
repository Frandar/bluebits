import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Category } from '../../models/category';
import { CategoriesService } from '../../services/categories.service';

@Component({
    selector: 'products-categories-banner',
    templateUrl: './categories-banner.component.html'
})
export class CategoriesBannerComponent implements OnInit, OnDestroy {
    categories: Category[] = [];
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(private categoriesService: CategoriesService) {}

    ngOnInit(): void {
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (categories) => {
                    this.categories = categories;
                },
                error: () => {
                    console.log('Snagged an error');
                }
            });
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }
}
