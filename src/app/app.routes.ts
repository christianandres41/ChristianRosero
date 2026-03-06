import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list.component';
import { ProductFormComponent } from './features/products/product-form.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'productos/nuevo', component: ProductFormComponent },
  { path: 'productos/:id/editar', component: ProductFormComponent },
  { path: '**', redirectTo: '' }
];
