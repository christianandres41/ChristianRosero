import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  validadorLongitudId,
  validadorFechaLiberacionNoEnFuturo,
  validadorFechaRevisionUnAnioDespuesLiberacion,
  obtenerHoyIso,
  agregarUnAnioIso
} from './product.validators';
import { ProductService } from './product.service';
import { Product } from './product.model';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  readonly today = obtenerHoyIso();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group(
    {
      id: this.fb.control('', {
        validators: [Validators.required, validadorLongitudId(3, 10)],
        asyncValidators: [this.createUniqueIdValidator()]
      }),
      name: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)]
      }),
      description: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
      }),
      logo: this.fb.control('', {
        validators: [Validators.required]
      }),
      date_release: this.fb.control(this.today, {
        validators: [Validators.required, validadorFechaLiberacionNoEnFuturo()]
      }),
      date_revision: this.fb.control(agregarUnAnioIso(this.today), {
        validators: [Validators.required]
      })
    },
    {
      validators: [validadorFechaRevisionUnAnioDespuesLiberacion('date_release')]
    }
  );

  submitting = false;
  submitError: string | null = null;
  isEditMode = false;
  private originalId: string | null = null;

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  private createUniqueIdValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = (control.value as string | null)?.trim() ?? '';

      if (!value) {
        return of(null);
      }

      if (control.hasError('required') || control.hasError('idLength')) {
        return of(null);
      }

      return this.productService.verificaId(value).pipe(
        map((exists) => (exists ? { idTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        return;
      }

      this.isEditMode = true;
      this.loadProduct(id);
    });
  }

  private loadProduct(id: string): void {
    this.submitting = true;
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.originalId = product.id;
        this.form.reset({
          id: product.id,
          name: product.name,
          description: product.description,
          logo: product.logo,
          date_release: (product.date_release as string).substring(0, 10),
          date_revision: (product.date_revision as string).substring(0, 10)
        });
        this.form.get('id')?.disable();
        this.submitting = false;
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.submitError =
          error instanceof Error ? error.message : 'No se pudo cargar la información del producto.';
      }
    });
  }

  onSubmit(): void {
    this.submitError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.id || !value.name || !value.description || !value.logo || !value.date_release || !value.date_revision) {
      return;
    }

    const product: Product = {
      id: value.id,
      name: value.name,
      description: value.description,
      logo: value.logo,
      date_release: value.date_release,
      date_revision: value.date_revision
    };

    this.submitting = true;

    const request$ = this.isEditMode && this.originalId
      ? this.productService.update(this.originalId, product)
      : this.productService.add(product);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/']);
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.submitError =
          error instanceof Error
            ? error.message
            : this.isEditMode
              ? 'No se pudo actualizar el producto.'
              : 'No se pudo agregar el producto.';
      }
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      window.location.reload();
      return;
    }

    this.form.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: this.today,
      date_revision: agregarUnAnioIso(this.today)
    });
    this.submitError = null;
  }

  hasControlError(controlName: string, errorKey: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorKey);
  }

  hasFormError(errorKey: string): boolean {
    return !!this.form.errors?.[errorKey] && this.form.touched;
  }
}

