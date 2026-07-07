import 'reflect-metadata';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import request from 'supertest';
import App from '@/app';
import { CreateUserDto } from '@/modules/users/users.dto';
import UsersRoute from '@/modules/users/users.route';
import UsersController from '@/modules/users/users.controller';
import s3PublicService from '@/utils/s3Public';
beforeAll(async () => {
  jest.setTimeout(10000);
});
afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

jest.mock('@/utils/s3Public', () => ({
  __esModule: true,
  default: {
    uploadPublicFile: jest.fn(),
  },
}));
describe('Testing Users', () => {
  describe('[POST] /users/:id/profile-picture', () => {
    it('uploads the profile picture to S3 and stores the public URL', async () => {
      const controller = new UsersController();
      const uploadPublicFileMock = jest.mocked(s3PublicService.uploadPublicFile);
      uploadPublicFileMock.mockResolvedValue({ key: 'users/user-123/profile-picture/avatar.png', url: 'https://cdn.example.com/users/user-123/profile-picture/avatar.png' });

      const updateUserMock = jest.spyOn(controller.userService, 'updateUser').mockResolvedValue({
        _id: 'user-123',
        email: 'user@example.com',
        picture: 'https://cdn.example.com/users/user-123/profile-picture/avatar.png',
      } as any);

      const req = {
        params: { id: 'user-123' },
        file: { path: '/tmp/avatar.png', originalname: 'avatar.png', mimetype: 'image/png' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await controller.uploadProfilePicture(req, res, next);

      expect(uploadPublicFileMock).toHaveBeenCalledWith(req.file, 'users/user-123/profile-picture');
      expect(updateUserMock).toHaveBeenCalledWith('user-123', { picture: 'https://cdn.example.com/users/user-123/profile-picture/avatar.png' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ picture: 'https://cdn.example.com/users/user-123/profile-picture/avatar.png' }),
        message: 'Profile picture updated',
      });
    });
  });

  describe('[GET] /users', () => {
    it('response findAll Users', async () => {
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      users.find = jest.fn().mockReturnValue([
        {
          _id: 'qpwoeiruty',
          email: 'a@email.com',
          password: await bcrypt.hash('q1w2e3r4!', 10),
        },
        {
          _id: 'alskdjfhg',
          email: 'b@email.com',
          password: await bcrypt.hash('a1s2d3f4!', 10),
        },
        {
          _id: 'zmxncbv',
          email: 'c@email.com',
          password: await bcrypt.hash('z1x2c3v4!', 10),
        },
      ]);
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).get(`${usersRoute.path}`).expect(200);
    });
    it('response findAll Users with filtering, sorting, and pagination', async () => {
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      usersRoute.usersController.userService.findUsersWithFilters = jest.fn().mockReturnValue({
        data: [
          {
            _id: 'qpwoeiruty',
            email: 'a@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: await bcrypt.hash('q1w2e3r4!', 10),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'findAll',
      });
      users.countDocuments = jest.fn().mockReturnValue(1);
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer())
        .get(`${usersRoute.path}?page=1&limit=10&sortBy=firstName&sortOrder=asc&email=a@email.com`)
        .expect(200);
    });
    it('response findAll Users with search functionality', async () => {
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      usersRoute.usersController.userService.findUsersWithFilters = jest.fn().mockReturnValue({
        data: [
          {
            _id: 'qpwoeiruty',
            email: 'john@email.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            totalOrdersCount: 5,
            password: await bcrypt.hash('q1w2e3r4!', 10),
          },
          {
            _id: 'alskdjfhg',
            email: 'jane@email.com',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+0987654321',
            totalOrdersCount: 12,
            password: await bcrypt.hash('a1s2d3f4!', 10),
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'findAll',
      });
      users.countDocuments = jest.fn().mockReturnValue(2);
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer())
        .get(`${usersRoute.path}?search=john`)
        .expect(200);
    });
    it('response findAll Users with total orders count', async () => {
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      usersRoute.usersController.userService.findUsersWithFilters = jest.fn().mockReturnValue({
        data: [
          {
            _id: 'qpwoeiruty',
            email: 'john@email.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            totalOrdersCount: 15,
            role: {
              _id: 'role_id',
              name: 'Customer',
              description: 'Regular customer',
              permissions: ['read:product', 'create:order']
            },
            userRoles: [
              {
                _id: 'userRole_id',
                userId: 'qpwoeiruty',
                roleId: {
                  _id: 'role_id',
                  name: 'Customer',
                  description: 'Regular customer',
                  permissions: ['read:product', 'create:order']
                },
                assignedBy: 'admin_user_id',
                assignedAt: new Date('2024-01-01T00:00:00.000Z')
              }
            ],
            password: await bcrypt.hash('q1w2e3r4!', 10),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'findAll',
      });
      users.countDocuments = jest.fn().mockReturnValue(1);
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer())
        .get(`${usersRoute.path}?sortBy=totalOrdersCount&sortOrder=desc`)
        .expect(200);
    });
  });
  describe('[GET] /users/:id', () => {
    it('response findOne User', async () => {
      const userId = 'qpwoeiruty';
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      users.findOne = jest.fn().mockReturnValue({
        _id: 'qpwoeiruty',
        email: 'a@email.com',
        password: await bcrypt.hash('q1w2e3r4!', 10),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).get(`${usersRoute.path}/${userId}`).expect(200);
    });
  });
  describe('[POST] /users', () => {
    it('response Create User', async () => {
      const userData = {
        email: 'test@email.com',
        password: 'q1w2e3r4',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        address: { street: '1 Main', city: 'Lagos', state: 'Lagos', postalCode: '10001', country: 'NG' },
        country: '64f0d55d8aef7e1b2d9e4b96',
      } as CreateUserDto;
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      users.findOne = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        _id: '60706478aad6c9ad19a31c84',
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).post(`${usersRoute.path}`).send(userData).expect(201);
    });
  });
  describe('[PUT] /users/:id', () => {
    it('response Update User', async () => {
      const userId = '60706478aad6c9ad19a31c84';
      const userData = {
        email: 'test@email.com',
        password: 'q1w2e3r4',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        address: { street: '1 Main', city: 'Lagos', state: 'Lagos', postalCode: '10001', country: 'NG' },
        country: '64f0d55d8aef7e1b2d9e4b96',
      } as CreateUserDto;
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      if (userData.email) {
        users.findOne = jest.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10),
        });
      }
      users.findByIdAndUpdate = jest.fn().mockReturnValue({
        _id: userId,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).put(`${usersRoute.path}/${userId}`).send(userData);
    });
  });
  describe('[DELETE] /users/:id', () => {
    it('response Delete User', async () => {
      const userId = '60706478aad6c9ad19a31c84';
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      users.findByIdAndDelete = jest.fn().mockReturnValue({
        _id: '60706478aad6c9ad19a31c84',
        email: 'test@email.com',
        password: await bcrypt.hash('q1w2e3r4!', 10),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).expect(200);
    });
  });
});