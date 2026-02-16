import 'reflect-metadata';
import 'module-alias/register';
import App from '@/app';
import AuthRoute from '@/modules/auth/auth.route';
import IndexRoute from '@/modules/index.route';
import OrdersRoute from '@/modules/orders/orders.route';
import PaymentsRoute from '@/modules/payments/payments.route';
import ProductsRoute from '@/modules/products/products.route';
import CartRoute from '@/modules/cart/cart.route';
import UsersRoute from '@/modules/users/users.route';
import CountriesRoute from '@/modules/countries/countries.route';
import CouponRoute from '@/modules/coupons/coupons.route';
import RoleRoute from '@/modules/roles/roles.route';
import AlbumCoverRoute from '@/modules/album-covers/album-covers.route';
import { EmailRoute } from '@/modules/email/email.route';
import BlackboxRoute from '@/modules/blackbox/blackbox.route';
import CountdownRoute from '@/modules/countdown/countdown.route';
import validateEnv from '@utils/validateEnv';
import ShippingRoute from '@/modules/shipping/shipping.route';
import jobProcessorService from '@/services/jobProcessor.service';
validateEnv();
jobProcessorService.start();
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
app.listen();