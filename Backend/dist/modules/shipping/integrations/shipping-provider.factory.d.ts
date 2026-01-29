import { ShippingProviderAPI } from './shipping-provider.interface';
export declare enum ProviderType {
    DHL = "DHL",
    FEDEX = "FEDEX",
    UPS = "UPS",
    USPS = "USPS"
}
declare class ShippingProviderFactory {
    private static providers;
    static getProvider(type: ProviderType): ShippingProviderAPI;
    static validateProvider(type: ProviderType): Promise<boolean>;
    static getAllProviders(): ProviderType[];
    static getImplementedProviders(): ProviderType[];
    static getAvailableProviders(): Promise<ProviderType[]>;
    static clearProviders(): void;
}
export default ShippingProviderFactory;
