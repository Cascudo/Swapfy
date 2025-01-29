import { useCallback } from 'react';
import { getSignature, IDL_V6, JUPITER_PROGRAM_V6_ID } from '@jup-ag/common';
import { useConnection } from '@jup-ag/wallet-adapter';
import { handleSendTransaction, TransactionError } from '@mercurial-finance/optimist';
import {
  Blockhash,
  Connection,
  Signer,
  Transaction,
  VersionedTransaction,
  VersionedTransactionResponse,
} from '@solana/web3.js';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

interface TransactionOptions {
  extraSigners?: Signer[];
  blockhash: Blockhash;
  lastValidBlockHeight: number;
  skipPreflight?: boolean;
}

type IExecuteTransactionResult =
  | {
      success: true;
      txid: string;
      transactionResponse: VersionedTransactionResponse;
    }
  | { success: false; txid?: string; error?: TransactionError }
  | { success: false; status: 'unknown'; txid: string };

// ------------------------------------
// New typed result for verification
// ------------------------------------
type VerificationResult =
  | { success: true; transaction: VersionedTransactionResponse }
  | { success: false; error: any };

export const useExecuteTransaction = () => {
  const { connection } = useConnection();
  const wallet = useWalletPassThrough();

  const executeTransaction = useCallback(
    async (
      tx: Transaction | VersionedTransaction,
      options: TransactionOptions,
      callback: {
        onPending: () => void;
        onSending: (txid: string) => void;
        onProcessed: () => void; // Not currently used, but preserved to avoid regressions
        onSuccess: (txid: string, transactionResponse: VersionedTransactionResponse) => void;
      }
    ): Promise<IExecuteTransactionResult> => {
      // -----------------------------------------------
      // Move getLatestBlockhash inside the callback
      // -----------------------------------------------
      const getLatestBlockhash = async () => {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(
          'confirmed'
        );
        return { blockhash, lastValidBlockHeight };
      };

      if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet not connected');
      }
      const signTransaction = wallet.signTransaction;

      let txid = '';
      let hasBeenSigned = false;
      let retryCount = 0;
      const MAX_RETRIES = 3;

      // ------------------------------------------------------
      // Updated verifyTransactionStatus with typed return
      // ------------------------------------------------------
      const verifyTransactionStatus = async (signature: string): Promise<VerificationResult> => {
        try {
          for (let i = 0; i < 5; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
            const confirmedTx = await connection.getTransaction(signature, {
              maxSupportedTransactionVersion: 0,
            });
            if (confirmedTx) {
              if (!confirmedTx.meta?.err) {
                return {
                  success: true,
                  transaction: confirmedTx as VersionedTransactionResponse,
                };
              }
              return {
                success: false,
                error: confirmedTx.meta.err,
              };
            }
          }
          return { success: false, error: 'Transaction not found' };
        } catch (error) {
          return { success: false, error };
        }
      };

      // ---------------------------------------------------------------------
      // attemptTransaction: Retries, timeouts, re-fetching blockhash if needed
      // ---------------------------------------------------------------------
      const attemptTransaction = async (): Promise<IExecuteTransactionResult> => {
        try {
          // Get fresh blockhash if this is a retry
          if (retryCount > 0) {
            const { blockhash, lastValidBlockHeight } = await getLatestBlockhash();
            options.blockhash = blockhash;
            options.lastValidBlockHeight = lastValidBlockHeight;

            // For legacy Transaction, set recentBlockhash directly
            if (tx instanceof Transaction) {
              tx.recentBlockhash = blockhash;
            }
          }

          console.log('Attempting transaction...', {
            attempt: retryCount + 1,
            hasFeePayer: tx instanceof Transaction ? !!tx.feePayer : 'versioned',
            blockhash: options.blockhash,
          });

          // Sign transaction if not already signed
          if (!hasBeenSigned) {
            callback.onPending();

            if (tx instanceof Transaction) {
              if (!tx.feePayer && wallet.publicKey) {
                tx.feePayer = wallet.publicKey;
              } else if (!tx.feePayer) {
                throw new Error('Wallet public key required for Transaction');
              }
              console.log('Transaction instructions:', {
                count: tx.instructions.length,
                programIds: tx.instructions.map((ix) => ix.programId.toString()),
              });
            }

            const signedTx = await signTransaction(tx);
            txid = getSignature(signedTx);
            hasBeenSigned = true;

            callback.onSending(txid);
            console.log('Transaction signed, sending...', { txid });

            // Set up a 30-second timeout for the transaction send
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Transaction timeout')), 30000)
            );

            // Send the signed transaction
            const sendPromise = handleSendTransaction({
              connection,
              blockhash: options.blockhash,
              lastValidBlockHeight: options.lastValidBlockHeight,
              signedTransaction: signedTx,
              skipPreflight: options.skipPreflight ?? true,
              idl: IDL_V6,
              idlProgramId: JUPITER_PROGRAM_V6_ID,
            });

            // Race the send against the timeout
            const response = (await Promise.race([sendPromise, timeoutPromise])) as any;

            if ('error' in response) {
              throw response.error;
            }

            console.log('Transaction sent, awaiting confirmation...', {
              txid,
              timestamp: new Date().toISOString(),
            });

            // Confirm the transaction
            const confirmation = await connection.confirmTransaction(
              {
                signature: txid,
                blockhash: options.blockhash,
                lastValidBlockHeight: options.lastValidBlockHeight,
              },
              'confirmed'
            );

            if (confirmation.value.err) {
              throw new Error(
                `Transaction confirmed with error: ${JSON.stringify(confirmation.value.err)}`
              );
            }

            // If success, call onSuccess
            callback.onSuccess(txid, response.transactionResponse);

            return {
              success: true,
              txid,
              transactionResponse: response.transactionResponse,
            };
          }

          // If we already signed, no further attempts are needed
          return { success: false, status: 'unknown', txid };
        } catch (error: any) {
          console.error('Transaction attempt failed:', {
            attempt: retryCount + 1,
            error: error?.message,
            txid,
          });

          // Check for "expired" or "not confirmed" errors
          if (
            error?.message?.includes('expired') ||
            error?.message?.includes('not confirmed')
          ) {
            console.log('Transaction reported as expired/not confirmed, verifying status...', {
              txid,
            });
            const verificationResult = await verifyTransactionStatus(txid);

            // Updated type check here
            if (verificationResult.success && verificationResult.transaction) {
              console.log('Transaction actually succeeded:', { txid });
              callback.onSuccess(txid, verificationResult.transaction);
              return {
                success: true,
                txid,
                transactionResponse: verificationResult.transaction,
              };
            }
            // If verification says it's not confirmed, proceed to retry logic
          }

          // Decide if we should retry
          if (
            retryCount < MAX_RETRIES &&
            (error?.message?.includes('expired') || error?.message?.includes('timeout'))
          ) {
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            return attemptTransaction();
          }

          throw error;
        }
      };

      // ---------------------------------------------------------------------
      // Main try/catch around attemptTransaction
      // ---------------------------------------------------------------------
      try {
        return await attemptTransaction();
      } catch (error: any) {
        console.error('All transaction attempts failed:', {
          error: error?.message,
          attempts: retryCount + 1,
          txid,
        });

        // Final attempt to check transaction status on chain
        if (txid) {
          try {
            const confirmedTx = await connection.getTransaction(txid, {
              maxSupportedTransactionVersion: 0,
            });
            if (confirmedTx && !confirmedTx.meta?.err) {
              callback.onSuccess(txid, confirmedTx as VersionedTransactionResponse);
              return {
                success: true,
                txid,
                transactionResponse: confirmedTx as VersionedTransactionResponse,
              };
            }
          } catch (confirmError) {
            console.error('Error checking final transaction status:', confirmError);
          }
        }

        // If we reach here, it's failed
        return {
          success: false,
          txid,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
    [wallet, connection]
  );

  return executeTransaction;
};
