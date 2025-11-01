import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { Login } from './components/login/login';
import { Profile } from './components/profile/profile';
import { authGuard } from './guards/auth-guard';
import { Rooms } from './components/rooms/rooms';
import { Register } from './components/register/register';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', redirectTo:'home', pathMatch:'full'},
  { path: 'home', component: Home},
  { path: 'profile', component: Profile , canActivate:[authGuard]},
  { path: 'login', component: Login},
  { path: 'register', component: Register},
  { path: 'Rooms', component: Rooms},
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate:[authGuard]},
  { path: '**', component: NotFound}
  

];
