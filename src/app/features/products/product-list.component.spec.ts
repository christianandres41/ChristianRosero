import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from './product.service';
import { Product } from './product.model';

class ProductServiceMock {
  getAll() {
    const products: Product[] = [
      {
        id: 'P001',
        name: 'Producto 1',
        description: 'Descripción 1',
        logo: 'logo1.png',
        date_release: '2024-03-04',
        date_revision: '2025-03-04'
      }
    ];
    return of(products);
  }
}

describe('ProductListComponent', () => {
  it('should create the list component', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent, RouterTestingModule],
      providers: [{ provide: ProductService, useClass: ProductServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.products().length).toBe(1);
  });

  it('should handle load errors gracefully', async () => {
    class ErrorServiceMock {
      getAll() {
        return throwError(() => new Error('Error de prueba'));
      }
    }

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, RouterTestingModule],
      providers: [{ provide: ProductService, useClass: ErrorServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loadError()).toContain('Error de prueba');
  });
});

