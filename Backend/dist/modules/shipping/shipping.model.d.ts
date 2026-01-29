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
/// <reference types="mongoose/types/inferschematype" />
import { Document } from 'mongoose';
import { ShippingProvider, ShippingZone, ShippingRate, ShippingLabel, ShippingPackage } from '../../modules/shipping/shipping.interface';
export declare const ShippingProviderModel: import("mongoose").Model<ShippingProvider & Document<any, any, any>, {}, {}, {}, any>;
export declare const ShippingZoneModel: import("mongoose").Model<ShippingZone & Document<any, any, any>, {}, {}, {}, any>;
export declare const ShippingRateModel: import("mongoose").Model<ShippingRate & Document<any, any, any>, {}, {}, {}, any>;
export declare const ShippingLabelModel: import("mongoose").Model<ShippingLabel & Document<any, any, any>, {}, {}, {}, any>;
export declare const ShippingPackageModel: import("mongoose").Model<ShippingPackage & Document<any, any, any>, {}, {}, {}, any>;
