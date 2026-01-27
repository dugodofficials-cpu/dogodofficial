import { hash } from 'bcrypt';
import { CreateUserDto } from '@/modules/users/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User, UserQueryParams, PaginatedUsersResponse } from '@/modules/users/users.interface';
import userModel from '@/modules/users/users.model';
import { isEmpty } from '@utils/util';
class UserService {
  public users = userModel;
  public async findAllUser(): Promise<User[]> {
    const users: User[] = await this.users.find().populate('role').populate('totalOrdersCount').populate('userRoles');
    return users;
  }
  public async userStatistics(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.users.countDocuments();
    return { totalUsers };
  }
  public async findUsersWithFilters(queryParams: UserQueryParams): Promise<PaginatedUsersResponse> {
    const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
    const filterObj: any = {};
    if (filters.email) {
      filterObj.email = { $regex: filters.email, $options: 'i' };
    }
    if (filters.firstName) {
      filterObj.firstName = { $regex: filters.firstName, $options: 'i' };
    }
    if (filters.lastName) {
      filterObj.lastName = { $regex: filters.lastName, $options: 'i' };
    }
    if (filters.phone) {
      filterObj.phone = { $regex: filters.phone, $options: 'i' };
    }
    if (filters['address.city']) {
      filterObj['address.city'] = { $regex: filters['address.city'], $options: 'i' };
    }
    if (filters['address.state']) {
      filterObj['address.state'] = { $regex: filters['address.state'], $options: 'i' };
    }
    if (filters['address.country']) {
      filterObj['address.country'] = { $regex: filters['address.country'], $options: 'i' };
    }
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      filterObj.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phone: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 'address.country': searchRegex },
      ];
    }
    if (filters.role) {
      filterObj.userRoles = filters.role;
    }
    if (filters.status) {
      filterObj.status = filters.status;
    }
    const sortObj: any = {};
    sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
    const skip = (pagination.page - 1) * pagination.limit;
    const total = await this.users.countDocuments(filterObj);
    const users: User[] = await this.users
      .find(filterObj)
      .populate('totalOrdersCount')
      .populate('userRoles')
      .sort(sortObj)
      .skip(skip)
      .limit(pagination.limit);
    const totalPages = Math.ceil(total / pagination.limit);
    return {
      data: users,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
      message: 'success',
    };
  }
  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');
    const findUser: User = await this.users.findOne({ _id: userId }).populate('role').populate('totalOrdersCount').populate('userRoles');
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    return findUser;
  }
  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);
    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({
      ...userData,
      password: hashedPassword,
      status: userData.status || 'active'
    });
    const populatedUser = await this.users.findById(createUserData._id).populate('role').populate('totalOrdersCount').populate('userRoles');
    return populatedUser;
  }
  public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    if (userData.email) {
      const findUser = await this.users.findOne({ email: userData.email });
      if (findUser && !findUser._id.equals(userId)) throw new HttpException(409, `This email ${userData.email} already exists`);
    }
    const updateData = { ...userData };
    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      updateData.password = hashedPassword;
    }
    const updateUserById: User = await this.users.findByIdAndUpdate(userId, updateData, { new: true }).populate('role').populate('totalOrdersCount').populate('userRoles');
    if (!updateUserById) throw new HttpException(409, "User doesn't exist");
    return updateUserById;
  }
  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: User = await this.users.findByIdAndDelete(userId).populate('role').populate('totalOrdersCount').populate('userRoles');
    if (!deleteUserById) throw new HttpException(409, "User doesn't exist");
    return deleteUserById;
  }
}
export default UserService;