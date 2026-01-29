/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { CreateCountdownDto, UpdateCountdownDto } from '../../modules/countdown/countdown.dto';
import { Countdown, CountdownQueryParams, PaginatedCountdownResponse, CountdownTimeRemaining } from '../../modules/countdown/countdown.interface';
declare class CountdownService {
    countdowns: import("mongoose").Model<Countdown & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    findAllCountdowns(): Promise<Countdown[]>;
    findCountdownsWithFilters(queryParams: CountdownQueryParams): Promise<PaginatedCountdownResponse>;
    findCountdownById(countdownId: string): Promise<Countdown>;
    findActiveCountdown(): Promise<Countdown | null>;
    createCountdown(countdownData: CreateCountdownDto): Promise<Countdown>;
    updateCountdown(countdownId: string, countdownData: UpdateCountdownDto): Promise<Countdown>;
    deleteCountdown(countdownId: string): Promise<Countdown>;
    getTimeRemaining(countdownId: string): Promise<CountdownTimeRemaining>;
    getActiveCountdownWithTimeRemaining(): Promise<{
        countdown: Countdown;
        timeRemaining: CountdownTimeRemaining;
    } | null>;
    updateExpiredCountdowns(): Promise<void>;
    countdownStatistics(): Promise<{
        totalCountdowns: number;
        activeCountdowns: number;
        expiredCountdowns: number;
    }>;
    activateCountdown(countdownId: string): Promise<Countdown>;
    deactivateCountdown(countdownId: string): Promise<Countdown>;
    deactivateAllCountdowns(): Promise<void>;
}
export default CountdownService;
