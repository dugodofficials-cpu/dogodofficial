import axios from 'axios';
import { PaymentStatus, PaymentTransaction } from '../payments.interface';
import { logger } from '@utils/logger';

export class CryptoPaymentProvider {
  private explorerApiUrl: string;

  constructor() {
    // Defaulting to a common explorer or aggregator, but this should be configurable
    // For MVP, we can use BlockCypher, Etherscan, or similar depending on the chain.
    // Let's assume a generic structure that can be expanded.
    this.explorerApiUrl = process.env.CRYPTO_EXPLORER_API_URL || 'https://api.blockcypher.com/v1/btc/main';
  }

  /**
   * Validates a transaction hash against a blockchain explorer
   * @param txid Transaction Hash
   * @param expectedAmount Expected amount in crypto
   * @param expectedAddress Destination wallet address
   * @returns Mapped status and transaction data
   */
  public async validateTransaction(txid: string, expectedAmount: number, expectedAddress: string): Promise<{ status: PaymentStatus; details: any }> {
    try {
      // Example implementation for BlockCypher (BTC)
      // This logic should be abstracted further if supporting multiple chains
      const response = await axios.get(`${this.explorerApiUrl}/txs/${txid}`);
      const txData = response.data;

      if (!txData) {
        return { status: PaymentStatus.FAILED, details: { error: 'Transaction not found' } };
      }

      // 1. Check if the transaction is confirmed (usually > 0 or > 3 confirmations)
      const confirmations = txData.confirmations || 0;
      if (confirmations < (parseInt(process.env.CRYPTO_MIN_CONFIRMATIONS) || 1)) {
        return { status: PaymentStatus.PROCESSING, details: txData };
      }

      // 2. Verify destination address and amount
      // In a real scenario, you'd loop through outputs to find the one matching your address
      const outputMatch = txData.outputs?.find((output: any) => 
        output.addresses?.includes(expectedAddress) && 
        output.value >= expectedAmount // amount in satoshis/wei usually
      );

      if (outputMatch) {
        return { status: PaymentStatus.COMPLETED, details: txData };
      }

      return { status: PaymentStatus.FAILED, details: { error: 'Amount or address mismatch', txData } };
    } catch (error) {
      logger.error(`[CryptoPaymentProvider] Validation failed for ${txid}:`, error.message);
      return { status: PaymentStatus.PENDING, details: { error: error.message } };
    }
  }
}

export default new CryptoPaymentProvider();
