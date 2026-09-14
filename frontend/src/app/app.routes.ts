import { Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { BookmarkScreen } from './components/screens/bookmark-screen/bookmark-screen';
import { AuthScreen } from './components/screens/auth-screen/auth-screen';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: BookmarkScreen },
      { path: 'auth', component: AuthScreen },
    ],
  },
];
