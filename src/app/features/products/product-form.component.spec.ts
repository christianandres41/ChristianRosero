import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from './product.service';
import { Product } from './product.model';

class ProductServiceMock {
  add(product: Product) {
    return of(product);
  }

  verificaId() {
    return of(false);
  }
}

describe('ProductFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, RouterTestingModule],
      providers: [{ provide: ProductService, useClass: ProductServiceMock }]
    }).compileComponents();
  });

  it('should create the form component', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should mark form as touched when submitting invalid form', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    jest.spyOn(component.form, 'markAllAsTouched');

    component.onSubmit();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
  });

  it('should call ProductService.add when form is valid', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(ProductService);
    const spy = jest.spyOn(service, 'add').mockReturnValue(of({} as Product));

    component.form.patchValue({
      id: 'ABC123',
      name: 'Producto válido',
      description: 'Descripción suficientemente larga',
      logo: 'http://logo.png',
      date_release: '2024-03-04',
      date_revision: '2025-03-04'
    });

    component.onSubmit();

    expect(spy).toHaveBeenCalled();
  });

  it('should set submitError when service fails', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(ProductService);
    jest.spyOn(service, 'add').mockReturnValue(throwError(() => new Error('Fallo en API')));

    component.form.patchValue({
      id: 'ABC123',
      name: 'Producto válido',
      description: 'Descripción suficientemente larga',
      logo: 'http://logo.png',
      date_release: '2024-03-04',
      date_revision: '2025-03-04'
    });

    component.onSubmit();

    expect(component.submitError).toBe('Fallo en API');
  });
});

