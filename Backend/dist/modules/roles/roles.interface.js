"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_VALUES = exports.Permission = void 0;
var Permission;
(function (Permission) {
    Permission["LOGIN"] = "login";
    Permission["CREATE_USER"] = "create:user";
    Permission["READ_USER"] = "read:user";
    Permission["UPDATE_USER"] = "update:user";
    Permission["DELETE_USER"] = "delete:user";
    Permission["CREATE_PRODUCT"] = "create:product";
    Permission["READ_PRODUCT"] = "read:product";
    Permission["UPDATE_PRODUCT"] = "update:product";
    Permission["DELETE_PRODUCT"] = "delete:product";
    Permission["CREATE_ORDER"] = "create:order";
    Permission["READ_ORDER"] = "read:order";
    Permission["UPDATE_ORDER"] = "update:order";
    Permission["DELETE_ORDER"] = "delete:order";
    Permission["CREATE_PAYMENT"] = "create:payment";
    Permission["READ_PAYMENT"] = "read:payment";
    Permission["UPDATE_PAYMENT"] = "update:payment";
    Permission["DELETE_PAYMENT"] = "delete:payment";
    Permission["PROCESS_REFUND"] = "process:refund";
    Permission["CREATE_SHIPMENT"] = "create:shipment";
    Permission["READ_SHIPMENT"] = "read:shipment";
    Permission["UPDATE_SHIPMENT"] = "update:shipment";
    Permission["DELETE_SHIPMENT"] = "delete:shipment";
    Permission["MANAGE_SHIPPING_LOCATIONS"] = "manage:shipping:locations";
    Permission["CREATE_CART"] = "create:cart";
    Permission["READ_CART"] = "read:cart";
    Permission["UPDATE_CART"] = "update:cart";
    Permission["DELETE_CART"] = "delete:cart";
    Permission["CREATE_ROLE"] = "create:role";
    Permission["READ_ROLE"] = "read:role";
    Permission["UPDATE_ROLE"] = "update:role";
    Permission["DELETE_ROLE"] = "delete:role";
    Permission["ASSIGN_ROLE"] = "assign:role";
    Permission["CREATE_COUPON"] = "create:coupon";
    Permission["READ_COUPON"] = "read:coupon";
    Permission["UPDATE_COUPON"] = "update:coupon";
    Permission["DELETE_COUPON"] = "delete:coupon";
    Permission["UPLOAD_MEDIA"] = "upload:media";
    Permission["DOWNLOAD_MEDIA"] = "download:media";
    Permission["SEND_EMAIL"] = "send:email";
    Permission["READ_EMAIL"] = "read:email";
    Permission["UPDATE_EMAIL"] = "update:email";
    Permission["DELETE_EMAIL"] = "delete:email";
    Permission["CREATE_BLACKBOX_QUESTION"] = "create:blackbox:question";
    Permission["READ_BLACKBOX_QUESTION"] = "read:blackbox:question";
    Permission["UPDATE_BLACKBOX_QUESTION"] = "update:blackbox:question";
    Permission["DELETE_BLACKBOX_QUESTION"] = "delete:blackbox:question";
    Permission["ANSWER_BLACKBOX_QUESTION"] = "answer:blackbox:question";
    Permission["CREATE_COUNTDOWN"] = "create:countdown";
    Permission["READ_COUNTDOWN"] = "read:countdown";
    Permission["UPDATE_COUNTDOWN"] = "update:countdown";
    Permission["DELETE_COUNTDOWN"] = "delete:countdown";
})(Permission = exports.Permission || (exports.Permission = {}));
exports.PERMISSION_VALUES = [
    "login",
    "create:user",
    "read:user",
    "update:user",
    "delete:user",
    "create:product",
    "read:product",
    "update:product",
    "delete:product",
    "create:order",
    "read:order",
    "update:order",
    "delete:order",
    "create:payment",
    "read:payment",
    "update:payment",
    "delete:payment",
    "process:refund",
    "create:shipment",
    "read:shipment",
    "update:shipment",
    "delete:shipment",
    "create:cart",
    "read:cart",
    "update:cart",
    "delete:cart",
    "create:role",
    "read:role",
    "update:role",
    "delete:role",
    "assign:role",
    "create:coupon",
    "read:coupon",
    "update:coupon",
    "delete:coupon",
    "upload:media",
    "download:media",
    "send:email",
    "read:email",
    "update:email",
    "delete:email",
    "create:blackbox:question",
    "read:blackbox:question",
    "update:blackbox:question",
    "delete:blackbox:question",
    "answer:blackbox:question",
    "create:countdown",
    "read:countdown",
    "update:countdown",
    "delete:countdown"
];
//# sourceMappingURL=roles.interface.js.map