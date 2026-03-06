import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from './product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve products from API', () => {
    const mockProducts: Product[] = [
      {
        id: 'P001',
        name: 'Producto 1',
        description: 'Descripción 1',
        logo: 'logo1.png',
        date_release: '2024-03-04',
        date_revision: '2025-03-04'
      }
    ];

    service.getAll().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockProducts });
  });

  it('should send product to API when adding', () => {
    const product: Product = {
      id: 'P002',
      name: 'Producto 2',
      description: 'Descripción 2',
      logo: 'logo2.png',
      date_release: '2024-03-04',
      date_revision: '2025-03-04'
    };

    service.add(product).subscribe((result) => {
      expect(result).toEqual(product);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(product);
    req.flush({ data: product });
  });

  it('should call verification endpoint when verifying identifier', () => {
    const id = 'ABC123';

    service.verificaId(id).subscribe((exists) => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products/verification/ABC123');
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should call delete endpoint when deleting a product', () => {
    const id = 'P001';

    service.delete(id).subscribe(() => {
      // no body expected, just ensure request completes
      expect(true).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products/P001');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Product removed successfully' });
  });
});

