import { ShippingProviderAPI } from './shipping-provider.interface';
import DHLProvider from './dhl-provider';
export enum ProviderType {
  DHL = 'DHL',
  FEDEX = 'FEDEX',
  UPS = 'UPS',
  USPS = 'USPS',
}
class ShippingProviderFactory {
  private static providers: Map<ProviderType, ShippingProviderAPI> = new Map();
  static getProvider(type: ProviderType): ShippingProviderAPI {
    if (!this.providers.has(type)) {
      switch (type) {
        case ProviderType.DHL:
          this.providers.set(type, new DHLProvider());
          break;
        default:
          throw new Error(`Shipping provider ${type} not implemented`);
      }
    }
    return this.providers.get(type)!;
  }
  static async validateProvider(type: ProviderType): Promise<boolean> {
    try {
      const provider = this.getProvider(type);
      return await provider.validateCredentials();
    } catch (error) {
      return false;
    }
  }
  static getAllProviders(): ProviderType[] {
    return Object.values(ProviderType);
  }
  static getImplementedProviders(): ProviderType[] {
    return [ProviderType.DHL];
  }
  static async getAvailableProviders(): Promise<ProviderType[]> {
    const implementedProviders = this.getImplementedProviders();
    const availableProviders: ProviderType[] = [];
    for (const provider of implementedProviders) {
      if (await this.validateProvider(provider)) {
        availableProviders.push(provider);
      }
    }
    return availableProviders;
  }
  static clearProviders(): void {
    this.providers.clear();
  }
}
export default ShippingProviderFactory;