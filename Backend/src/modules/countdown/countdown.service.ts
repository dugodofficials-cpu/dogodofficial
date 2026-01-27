import { CreateCountdownDto, UpdateCountdownDto } from '@/modules/countdown/countdown.dto';
import { HttpException } from '@exceptions/HttpException';
import { Countdown, CountdownQueryParams, PaginatedCountdownResponse, CountdownTimeRemaining, CountdownStatus } from '@/modules/countdown/countdown.interface';
import countdownModel from '@/modules/countdown/countdown.model';
import { isEmpty } from '@utils/util';
class CountdownService {
  public countdowns = countdownModel;
  public async findAllCountdowns(): Promise<Countdown[]> {
    const countdowns: Countdown[] = await this.countdowns.find().sort({ createdAt: -1 });
    return countdowns;
  }
  public async findCountdownsWithFilters(queryParams: CountdownQueryParams): Promise<PaginatedCountdownResponse> {
    const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
    const filterObj: any = {};
    if (filters.status) {
      filterObj.status = filters.status;
    }
    if (filters.isActive !== undefined) {
      filterObj.isActive = filters.isActive;
    }
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      filterObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { customMessage: searchRegex },
      ];
    }
    const sortObj: any = {};
    sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
    const skip = (pagination.page - 1) * pagination.limit;
    const total = await this.countdowns.countDocuments(filterObj);
    const countdowns: Countdown[] = await this.countdowns
      .find(filterObj)
      .sort(sortObj)
      .skip(skip)
      .limit(pagination.limit);
    const totalPages = Math.ceil(total / pagination.limit);
    return {
      data: countdowns,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
      message: 'success',
    };
  }
  public async findCountdownById(countdownId: string): Promise<Countdown> {
    if (isEmpty(countdownId)) throw new HttpException(400, 'CountdownId is empty');
    const findCountdown: Countdown = await this.countdowns.findById(countdownId);
    if (!findCountdown) throw new HttpException(409, "Countdown doesn't exist");
    return findCountdown;
  }
  public async findActiveCountdown(): Promise<Countdown | null> {
    const activeCountdown: Countdown | null = await this.countdowns.findOne({
      isActive: true,
      status: CountdownStatus.ACTIVE
    }).sort({ createdAt: -1 });
    return activeCountdown;
  }
  public async createCountdown(countdownData: CreateCountdownDto): Promise<Countdown> {
    if (isEmpty(countdownData)) throw new HttpException(400, 'CountdownData is empty');
    const launchDate = new Date(countdownData.launchDate);
    const now = new Date();
    if (launchDate <= now) {
      throw new HttpException(400, 'Launch date must be in the future');
    }
    if (countdownData.isActive) {
      await this.countdowns.updateMany({}, { isActive: false });
    }
    const createCountdownData: Countdown = await this.countdowns.create({
      ...countdownData,
      launchDate,
      status: countdownData.status || CountdownStatus.ACTIVE,
      isActive: countdownData.isActive !== undefined ? countdownData.isActive : true,
    });
    return createCountdownData;
  }
  public async updateCountdown(countdownId: string, countdownData: UpdateCountdownDto): Promise<Countdown> {
    if (isEmpty(countdownData)) throw new HttpException(400, 'CountdownData is empty');
    if (countdownData.launchDate) {
      const launchDate = new Date(countdownData.launchDate);
      const now = new Date();
      if (launchDate <= now) {
        throw new HttpException(400, 'Launch date must be in the future');
      }
    }
    if (countdownData.isActive) {
      await this.countdowns.updateMany({ _id: { $ne: countdownId } }, { isActive: false });
    }
    const updateData: any = { ...countdownData };
    if (countdownData.launchDate) {
      updateData.launchDate = new Date(countdownData.launchDate);
    }
    const updateCountdownById: Countdown = await this.countdowns.findByIdAndUpdate(
      countdownId,
      updateData,
      { new: true }
    );
    if (!updateCountdownById) throw new HttpException(409, "Countdown doesn't exist");
    return updateCountdownById;
  }
  public async deleteCountdown(countdownId: string): Promise<Countdown> {
    const deleteCountdownById: Countdown = await this.countdowns.findByIdAndDelete(countdownId);
    if (!deleteCountdownById) throw new HttpException(409, "Countdown doesn't exist");
    return deleteCountdownById;
  }
  public async getTimeRemaining(countdownId: string): Promise<CountdownTimeRemaining> {
    const countdown = await this.findCountdownById(countdownId);
    const now = new Date();
    const launchDate = new Date(countdown.launchDate);
    const diff = launchDate.getTime() - now.getTime();
    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true,
      };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return {
      days,
      hours,
      minutes,
      seconds,
      total: diff,
      isExpired: false,
    };
  }
  public async getActiveCountdownWithTimeRemaining(): Promise<{ countdown: Countdown; timeRemaining: CountdownTimeRemaining } | null> {
    const activeCountdown = await this.findActiveCountdown();
    if (!activeCountdown) {
      return null;
    }
    const timeRemaining = await this.getTimeRemaining(activeCountdown._id.toString());
    return {
      countdown: activeCountdown,
      timeRemaining,
    };
  }
  public async updateExpiredCountdowns(): Promise<void> {
    const now = new Date();
    await this.countdowns.updateMany(
      {
        launchDate: { $lte: now },
        status: CountdownStatus.ACTIVE
      },
      {
        status: CountdownStatus.EXPIRED,
        isActive: false
      }
    );
  }
  public async countdownStatistics(): Promise<{ totalCountdowns: number; activeCountdowns: number; expiredCountdowns: number }> {
    const totalCountdowns = await this.countdowns.countDocuments();
    const activeCountdowns = await this.countdowns.countDocuments({
      status: CountdownStatus.ACTIVE,
      isActive: true
    });
    const expiredCountdowns = await this.countdowns.countDocuments({
      status: CountdownStatus.EXPIRED
    });
    return {
      totalCountdowns,
      activeCountdowns,
      expiredCountdowns,
    };
  }
  public async activateCountdown(countdownId: string): Promise<Countdown> {
    if (isEmpty(countdownId)) throw new HttpException(400, 'CountdownId is empty');
    await this.countdowns.updateMany({ _id: { $ne: countdownId } }, { isActive: false });
    const activateCountdownById: Countdown = await this.countdowns.findByIdAndUpdate(
      countdownId,
      { isActive: true, status: CountdownStatus.ACTIVE },
      { new: true }
    );
    if (!activateCountdownById) throw new HttpException(409, "Countdown doesn't exist");
    return activateCountdownById;
  }
  public async deactivateCountdown(countdownId: string): Promise<Countdown> {
    if (isEmpty(countdownId)) throw new HttpException(400, 'CountdownId is empty');
    const deactivateCountdownById: Countdown = await this.countdowns.findByIdAndUpdate(
      countdownId,
      { isActive: false },
      { new: true }
    );
    if (!deactivateCountdownById) throw new HttpException(409, "Countdown doesn't exist");
    return deactivateCountdownById;
  }
  public async deactivateAllCountdowns(): Promise<void> {
    await this.countdowns.updateMany({}, { isActive: false });
  }
}
export default CountdownService;