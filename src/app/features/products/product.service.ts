import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Product } from './product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly productsPath = '/bp/products';
  private readonly verificationPath = '/bp/products/verification';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Product[]> {
    const url = `${this.apiBaseUrl}${this.productsPath}`;
    return this.http.get<{ data: Product[] }>(url).pipe(
      map((response) => response.data ?? []),
      catchError((error) => {
        return throwError(() => this.crearErrorDetallado('No se pudo obtener el listado de productos.', error));
      })
    );
  }

  add(product: Product): Observable<Product> {
    const url = `${this.apiBaseUrl}${this.productsPath}`;
    return this.http.post<{ data: Product }>(url, product).pipe(
      map((response) => response.data),
      catchError((error) => {
        const message =
          error?.status === 400
            ? 'El identificador ya existe o los datos no son válidos.'
            : 'No se pudo agregar el producto. Inténtalo nuevamente.';

        return throwError(() => this.crearErrorDetallado(message, error));
      })
    );
  }

  getById(id: string): Observable<Product> {
    const url = `${this.apiBaseUrl}${this.productsPath}/${encodeURIComponent(id)}`;
    return this.http.get<Product>(url).pipe(
      catchError((error) => {
        return throwError(() =>
          this.crearErrorDetallado('No se pudo obtener la información del producto.', error)
        );
      })
    );
  }

  update(id: string, product: Product): Observable<Product> {
    const url = `${this.apiBaseUrl}${this.productsPath}/${encodeURIComponent(id)}`;
    return this.http.put<{ data: Product } | Product>(url, product).pipe(
      map((response: { data: Product } | Product) =>
        (response as { data: Product }).data ?? (response as Product)
      ),
      catchError((error) => {
        return throwError(() =>
          this.crearErrorDetallado('No se pudo actualizar el producto. Inténtalo nuevamente.', error)
        );
      })
    );
  }

  verificaId(id: string): Observable<boolean> {
    const url = `${this.apiBaseUrl}${this.verificationPath}/${encodeURIComponent(id)}`;
    return this.http.get<boolean>(url).pipe(
      catchError((error) => {
        return throwError(
          () => this.crearErrorDetallado('No se pudo verificar el identificador del producto.', error)
        );
      })
    );
  }

  delete(id: string): Observable<void> {
    const url = `${this.apiBaseUrl}${this.productsPath}/${encodeURIComponent(id)}`;
    return this.http.delete<{ message?: string }>(url).pipe(
      map(() => void 0),
      catchError((error) => {
        return throwError(() =>
          this.crearErrorDetallado('No se pudo eliminar el producto. Inténtalo nuevamente.', error)
        );
      })
    );
  }

  private crearErrorDetallado(message: string, error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`${message} Detalle técnico: ${error.message}`);
    }

    return new Error(message);
  }
}

