import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CookieService } from '../services/cookie.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);

  let url = req.url;
  if (url.startsWith('/api')) {
    url = `${environment.apiUrl}${url}`;
  }

  const token = cookieService.get('token');
  let headers = req.headers;

  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const clonedReq = req.clone({
    url,
    headers,
  });

  return next(clonedReq);
};
