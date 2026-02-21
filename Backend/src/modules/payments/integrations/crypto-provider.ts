import axios from 'axios';
import { PaymentStatus, PaymentTransaction } from '../payments.interface';
import { logger } from '@utils/logger';

 type CryptoValidationParams = {
   txid: string;
   expectedAddress?: string;
   expectedAmountSmallestUnit?: number;
 };

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
  public async validateTransaction(txid: string, expectedAmount: number, expectedAddress: string): Promise<{ status: PaymentStatus; details: any }>;
  public async validateTransaction(params: CryptoValidationParams): Promise<{ status: PaymentStatus; details: any }>;
  public async validateTransaction(
    txidOrParams: string | CryptoValidationParams,
    expectedAmount?: number,
    expectedAddress?: string,
  ): Promise<{ status: PaymentStatus; details: any }> {
    const params: CryptoValidationParams =
      typeof txidOrParams === 'string'
        ? {
            txid: txidOrParams,
            expectedAddress,
            // Backward-compatible: previously this was passed as a plain number,
            // but it was ambiguous (fiat vs smallest-unit). We only enforce amount
            // matching if you explicitly pass the smallest-unit value via metadata.
            expectedAmountSmallestUnit: undefined,
          }
        : txidOrParams;

    const { txid, expectedAmountSmallestUnit } = params;
    const normalizedExpectedAddress = params.expectedAddress;
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
      const outputs: any[] = Array.isArray(txData.outputs) ? txData.outputs : [];
      const addressMatches = normalizedExpectedAddress
        ? outputs.some(output => Array.isArray(output.addresses) && output.addresses.includes(normalizedExpectedAddress))
        : true;

      if (!addressMatches) {
        return {
          status: PaymentStatus.FAILED,
          details: {
            error: 'Destination address mismatch',
            expectedAddress: normalizedExpectedAddress,
            txData,
          },
        };
      }

      if (typeof expectedAmountSmallestUnit === 'number') {
        const amountMatches = outputs.some(output => {
          const value = Number(output?.value);
          return Number.isFinite(value) && value >= expectedAmountSmallestUnit;
        });

        if (!amountMatches) {
          return {
            status: PaymentStatus.FAILED,
            details: {
              error: 'Amount mismatch',
              expectedAmountSmallestUnit,
              txData,
            },
          };
        }
      }

      return { status: PaymentStatus.COMPLETED, details: txData };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[CryptoPaymentProvider] Validation failed for ${txid}:`, message);
      return {
        status: PaymentStatus.PENDING,
        details: {
          error: message,
          explorerApiUrl: this.explorerApiUrl,
        },
      };
    }
  }
}

export default new CryptoPaymentProvider();
