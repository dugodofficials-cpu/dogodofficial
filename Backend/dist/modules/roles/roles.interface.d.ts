export declare enum Permission {
    LOGIN = "login",
    CREATE_USER = "create:user",
    READ_USER = "read:user",
    UPDATE_USER = "update:user",
    DELETE_USER = "delete:user",
    CREATE_PRODUCT = "create:product",
    READ_PRODUCT = "read:product",
    UPDATE_PRODUCT = "update:product",
    DELETE_PRODUCT = "delete:product",
    CREATE_ORDER = "create:order",
    READ_ORDER = "read:order",
    UPDATE_ORDER = "update:order",
    DELETE_ORDER = "delete:order",
    CREATE_PAYMENT = "create:payment",
    READ_PAYMENT = "read:payment",
    UPDATE_PAYMENT = "update:payment",
    DELETE_PAYMENT = "delete:payment",
    PROCESS_REFUND = "process:refund",
    CREATE_SHIPMENT = "create:shipment",
    READ_SHIPMENT = "read:shipment",
    UPDATE_SHIPMENT = "update:shipment",
    DELETE_SHIPMENT = "delete:shipment",
    MANAGE_SHIPPING_LOCATIONS = "manage:shipping:locations",
    CREATE_CART = "create:cart",
    READ_CART = "read:cart",
    UPDATE_CART = "update:cart",
    DELETE_CART = "delete:cart",
    CREATE_ROLE = "create:role",
    READ_ROLE = "read:role",
    UPDATE_ROLE = "update:role",
    DELETE_ROLE = "delete:role",
    ASSIGN_ROLE = "assign:role",
    CREATE_COUPON = "create:coupon",
    READ_COUPON = "read:coupon",
    UPDATE_COUPON = "update:coupon",
    DELETE_COUPON = "delete:coupon",
    UPLOAD_MEDIA = "upload:media",
    DOWNLOAD_MEDIA = "download:media",
    SEND_EMAIL = "send:email",
    READ_EMAIL = "read:email",
    UPDATE_EMAIL = "update:email",
    DELETE_EMAIL = "delete:email",
    CREATE_BLACKBOX_QUESTION = "create:blackbox:question",
    READ_BLACKBOX_QUESTION = "read:blackbox:question",
    UPDATE_BLACKBOX_QUESTION = "update:blackbox:question",
    DELETE_BLACKBOX_QUESTION = "delete:blackbox:question",
    ANSWER_BLACKBOX_QUESTION = "answer:blackbox:question",
    CREATE_COUNTDOWN = "create:countdown",
    READ_COUNTDOWN = "read:countdown",
    UPDATE_COUNTDOWN = "update:countdown",
    DELETE_COUNTDOWN = "delete:countdown"
}
export declare const PERMISSION_VALUES: readonly ["login", "create:user", "read:user", "update:user", "delete:user", "create:product", "read:product", "update:product", "delete:product", "create:order", "read:order", "update:order", "delete:order", "create:payment", "read:payment", "update:payment", "delete:payment", "process:refund", "create:shipment", "read:shipment", "update:shipment", "delete:shipment", "create:cart", "read:cart", "update:cart", "delete:cart", "create:role", "read:role", "update:role", "delete:role", "assign:role", "create:coupon", "read:coupon", "update:coupon", "delete:coupon", "upload:media", "download:media", "send:email", "read:email", "update:email", "delete:email", "create:blackbox:question", "read:blackbox:question", "update:blackbox:question", "delete:blackbox:question", "answer:blackbox:question", "create:countdown", "read:countdown", "update:countdown", "delete:countdown"];
export interface Role {
    _id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isDefault?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserRole {
    userId: string;
    roleId: string;
    assignedBy: string;
    assignedAt: Date;
}
