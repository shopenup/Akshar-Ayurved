import { defineMiddlewares } from '@shopenup/shopenup';
import { adminProductTypeRoutesMiddlewares } from './store/custom/product-types/middlewares';
import { authenticate } from '@shopenup/framework';

export default defineMiddlewares([
  ...adminProductTypeRoutesMiddlewares,
  {
    method: 'ALL',
    matcher: '/store/custom/customer/*',
    middlewares: [authenticate('customer', ['session', 'bearer'])],
  },
]);
