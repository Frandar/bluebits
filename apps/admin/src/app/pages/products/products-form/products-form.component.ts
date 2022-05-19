import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoriesService, Category, Product, ProductsService } from '@bluebits/products';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-products-form',
    templateUrl: './products-form.component.html',
    styles: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    editMode = false;
    currentProductId: string;
    categories: Category[] = [];
    imageDisplay: string | ArrayBuffer;
    private readonly endsubs$: Subject<void> = new Subject();
    constructor(
        private formBuilder: FormBuilder,
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private location: Location,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this._initProductForm();
        this._getCategories();
        this._checkEditMode();
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete();
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const productFormData = new FormData();
        Object.keys(this.productForm).map((key) => {
            productFormData.append(key, this.productForm[key].value);
        });
        if (this.editMode) {
            this._updateProduct(productFormData);
        } else {
            this._addProduct(productFormData);
        }
    }

    onCancel() {
        this.location.back();
    }

    private _initProductForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            brand: ['', Validators.required],
            price: ['', Validators.required],
            category: ['', Validators.required],
            countInStock: ['', Validators.required],
            description: ['', Validators.required],
            richDescription: [''],
            image: ['', Validators.required],
            isFeatured: [false]
        });
    }

    onImageUpload(files: FileList) {
        const file = files[0];
        if (file) {
            this.form.patchValue({ image: file });
            this.form.get('image').updateValueAndValidity();
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.imageDisplay = fileReader.result;
            };
            fileReader.readAsDataURL(file);
        }
    }

    private _addProduct(productData: FormData) {
        this.productsService
            .createProduct(productData)
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (product: Product) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Product ${product.name} is created!`
                    });

                    setTimeout(() => {
                        this.location.back();
                    }, 2000);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Product is not created'
                    });
                }
            });
    }

    private _updateProduct(productData: FormData) {
        this.productsService
            .updateProduct(productData, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe({
                next: (product: Product) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Product ${product.name} is created!`
                    });

                    setTimeout(() => {
                        this.location.back();
                    }, 2000);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Product is not created'
                    });
                }
            });
    }

    private _getCategories() {
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endsubs$))
            .subscribe((categories) => {
                this.categories = categories;
            });
    }

    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
            if (params.id) {
                this.editMode = true;
                this.currentProductId = params.id;
                this.productsService
                    .getProduct(params.id)
                    .pipe(takeUntil(this.endsubs$))
                    .subscribe({
                        next: (product) => {
                            this.productForm.name.setValue(product.name);
                            this.productForm.category.setValue(product.category.id);
                            this.productForm.brand.setValue(product.brand);
                            this.productForm.price.setValue(product.price);
                            this.productForm.countInStock.setValue(product.countInStock);
                            this.productForm.isFeatured.setValue(product.isFeatured);
                            this.productForm.description.setValue(product.description);
                            this.productForm.richDescription.setValue(product.richDescription);
                            this.imageDisplay = product.image;
                            this.productForm.image.setValidators([]);
                            this.productForm.image.updateValueAndValidity();
                        }
                    });
            }
        });
    }

    get productForm() {
        return this.form.controls;
    }
}
