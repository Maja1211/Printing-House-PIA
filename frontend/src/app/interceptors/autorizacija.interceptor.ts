import { HttpInterceptorFn } from '@angular/common/http';

export const autorizacijaInterceptor: HttpInterceptorFn = (req, next) => {

  const podatak = localStorage.getItem('ulogovan');

  if (podatak == null) {
    return next(req);
  }

  const ulogovan = JSON.parse(podatak);

  const zahtjev = req.clone({
    setHeaders: {
      'x-kor-ime': ulogovan.kor_ime
    }
  });

  return next(zahtjev);
};
