"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderType = void 0;
const tslib_1 = require("tslib");
const dhl_provider_1 = tslib_1.__importDefault(require("./dhl-provider"));
var ProviderType;
(function (ProviderType) {
    ProviderType["DHL"] = "DHL";
    ProviderType["FEDEX"] = "FEDEX";
    ProviderType["UPS"] = "UPS";
    ProviderType["USPS"] = "USPS";
})(ProviderType = exports.ProviderType || (exports.ProviderType = {}));
class ShippingProviderFactory {
    static getProvider(type) {
        if (!this.providers.has(type)) {
            switch (type) {
                case ProviderType.DHL:
                    this.providers.set(type, new dhl_provider_1.default());
                    break;
                default:
                    throw new Error(`Shipping provider ${type} not implemented`);
            }
        }
        return this.providers.get(type);
    }
    static async validateProvider(type) {
        try {
            const provider = this.getProvider(type);
            return await provider.validateCredentials();
        }
        catch (error) {
            return false;
        }
    }
    static getAllProviders() {
        return Object.values(ProviderType);
    }
    static getImplementedProviders() {
        return [ProviderType.DHL];
    }
    static async getAvailableProviders() {
        const implementedProviders = this.getImplementedProviders();
        const availableProviders = [];
        for (const provider of implementedProviders) {
            if (await this.validateProvider(provider)) {
                availableProviders.push(provider);
            }
        }
        return availableProviders;
    }
    static clearProviders() {
        this.providers.clear();
    }
}
ShippingProviderFactory.providers = new Map();
exports.default = ShippingProviderFactory;
//# sourceMappingURL=shipping-provider.factory.js.map