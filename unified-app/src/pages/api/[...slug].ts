import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import App from '@backend/app';
import IndexRoute from '@backend/index.route';
import AuthRoute from '@backend/auth/auth.route';
import UsersRoute from '@backend/users/users.route';
import ProductsRoute from '@backend/products/products.route';
import OrdersRoute from '@backend/orders/orders.route';
import CountriesRoute from '@backend/countries/countries.route';
import PaymentsRoute from '@backend/payments/payments.route';
import CartRoute from '@backend/cart/cart.route';
import CouponRoute from '@backend/coupons/coupons.route';
import RoleRoute from '@backend/roles/roles.route';
import AlbumCoverRoute from '@backend/album-covers/album-covers.route';
import { EmailRoute } from '@backend/email/email.route';
import BlackboxRoute from '@backend/blackbox/blackbox.route';
import CountdownRoute from '@backend/countdown/countdown.route';
import ShippingRoute from '@backend/shipping/shipping.route';
import validateEnv from '@backend/utils/validateEnv';

validateEnv();

let expressApp: ReturnType<App['getServer']> | undefined;

function getExpressApp() {
  if (!expressApp) {
    const app = new App([
      new IndexRoute(),
      new UsersRoute(),
      new AuthRoute(),
      new ProductsRoute(),
      new OrdersRoute(),
      new CountriesRoute(),
      new PaymentsRoute(),
      new CartRoute(),
      new CouponRoute(),
      new RoleRoute(),
      new AlbumCoverRoute(),
      new EmailRoute(),
      new BlackboxRoute(),
      new CountdownRoute(),
      new ShippingRoute(),
    ]);
    expressApp = app.getServer();
  }
  return expressApp;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  req.url = (req.url || '').replace(/^\/api/, '') || '/';
  // Next.js pre-populates req.query with the catch-all route segment; let
  // Express's own query parser derive it fresh from the rewritten req.url.
  delete (req as { query?: unknown }).query;
  getExpressApp()(req, res);
}
