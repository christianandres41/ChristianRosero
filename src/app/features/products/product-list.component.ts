import { Component, OnDestroy, OnInit, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from './product.service';
import { Product } from './product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  readonly products = signal<Product[]>([]);
  readonly searchTerm = signal<string>('');
  readonly pageSizeOptions = [5, 10, 20];
  readonly pageSize = signal<number>(5);
  readonly currentPage = signal<number>(1);
  readonly loading = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);
  readonly openMenuForId = signal<string | null>(null);
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly deleting = signal<boolean>(false);
  readonly deleteError = signal<string | null>(null);
  readonly productPendingDelete = signal<Product | null>(null);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.products();
    if (!term) {
      return all;
    }
    return all.filter((product) => {
      return (
        product.id.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    });
  });

  readonly totalResults = computed(() => this.filteredProducts().length);
  readonly totalPages = computed(() =>
    this.totalResults() === 0 ? 1 : Math.ceil(this.totalResults() / this.pageSize())
  );

  readonly paginatedProducts = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredProducts().slice(start, start + size);
  });

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router
  ) {
    effect(() => {
      // Reiniciar a la primera página cuando cambian los filtros.
      this.filteredProducts();
      this.currentPage.set(1);
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
  }

  onPageSizeChange(value: string): void {
    const size = Number(value) || 5;
    this.pageSize.set(size);
  }

  goToFirstPage(): void {
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
    }
  }

  goToNextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.currentPage.set(current + 1);
    }
  }

  goToLastPage(): void {
    this.currentPage.set(this.totalPages());
  }

  navigateToCreate(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  toggleMenu(productId: string): void {
    const current = this.openMenuForId();
    this.openMenuForId.set(current === productId ? null : productId);
  }

  closeMenu(): void {
    this.openMenuForId.set(null);
  }

  navigateToEdit(product: Product): void {
    this.closeMenu();
    this.router.navigate(['/productos', product.id, 'editar']);
  }

  openDeleteDialog(product: Product): void {
    this.productPendingDelete.set(product);
    this.deleteError.set(null);
    this.deleteDialogOpen.set(true);
    this.closeMenu();
  }

  closeDeleteDialog(): void {
    this.deleteDialogOpen.set(false);
    this.productPendingDelete.set(null);
    this.deleting.set(false);
    this.deleteError.set(null);
  }

  confirmDelete(): void {
    const product = this.productPendingDelete();
    if (!product || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.productService.delete(product.id).subscribe({
      next: () => {
        const remaining = this.products().filter((p) => p.id !== product.id);
        this.products.set(remaining);
        this.deleting.set(false);
        this.closeDeleteDialog();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.deleteError.set(
          error instanceof Error ? error.message : 'No se pudo eliminar el producto.'
        );
      }
    });
  }

  private cargarProductos(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.subscription = this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Error desconocido al cargar productos.';
        this.loadError.set(message);
        this.loading.set(false);
      }
    });
  }
}

