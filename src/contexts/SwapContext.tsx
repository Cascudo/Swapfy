// src/contexts/SwapContext.tsx
import {
  fetchSourceAddressAndDestinationAddress,
  getTokenBalanceChangesFromTransactionResponse,
} from '@jup-ag/common';
import {
  QuoteResponseMeta,
  SwapMode,
  SwapResult,
  UseJupiterProps,
  useJupiter,
} from '@jup-ag/react-hook';
import { useConnection, useLocalStorage } from '@jup-ag/wallet-adapter';
import { TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_MAX_DYNAMIC_SLIPPAGE_PCT,
  DEFAULT_SLIPPAGE_PCT,
  WRAPPED_SOL_MINT,
} from 'src/constants';
import {
  fromLamports,
  getAssociatedTokenAddressSync,
  hasNumericValue,
} from 'src/misc/utils';
import { useReferenceFeesQuery } from 'src/queries/useReferenceFeesQuery';
import { FormProps, IInit, IOnRequestIxCallback } from 'src/types';
import { usePrioritizationFee } from './PrioritizationFeeContextProvider';
import { useScreenState } from './ScreenProvider';
import { useTokenContext } from './TokenContextProvider';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import { useAccounts } from './accounts';
import { useExecuteTransaction } from 'src/hooks/useExecuteTransaction';

export type SlippageMode = 'DYNAMIC' | 'FIXED';
const SLIPPAGE_MODE_DEFAULT: SlippageMode = 'DYNAMIC';

export interface IForm {
  fromMint: string;
  toMint: string;
  fromValue: string;
  toValue: string;
  slippageBps: number;
  userSlippageMode: SlippageMode;
  dynamicSlippageBps: number;
}

export type SwappingStatus =
  | 'loading'
  | 'pending-approval'
  | 'sending'
  | 'fail'
  | 'success'
  | 'timeout';
export interface ISwapContext {
  form: IForm;
  setForm: Dispatch<SetStateAction<IForm>>;
  isToPairFocused: MutableRefObject<boolean>;

  errors: Record<string, { title: string; message: string }>;
  setErrors: Dispatch<
    SetStateAction<
      Record<
        string,
        {
          title: string;
          message: string;
        }
      >
    >
  >;
  fromTokenInfo?: TokenInfo | null;
  toTokenInfo?: TokenInfo | null;
  quoteResponseMeta: QuoteResponseMeta | null;
  setQuoteResponseMeta: Dispatch<SetStateAction<QuoteResponseMeta | null>>;
  onSubmit: () => Promise<SwapResult | null>;
  onRequestIx: () => Promise<IOnRequestIxCallback>;
  lastSwapResult: {
    swapResult: SwapResult;
    quoteResponseMeta: QuoteResponseMeta | null;
  } | null;
  formProps: FormProps;
  displayMode: IInit['displayMode'];
  scriptDomain: IInit['scriptDomain'];
  swapping: {
    txStatus:
      | {
          txid: string;
          status: SwappingStatus;
          quotedDynamicSlippageBps: string | undefined;
        }
      | undefined;
  };
  reset: (props?: { resetValues: boolean }) => void;
  jupiter: {
    asLegacyTransaction: boolean;
    setAsLegacyTransaction: Dispatch<SetStateAction<boolean>>;
    quoteResponseMeta: QuoteResponseMeta | undefined | null;
    loading: ReturnType<typeof useJupiter>['loading'];
    refresh: ReturnType<typeof useJupiter>['refresh'];
    error: ReturnType<typeof useJupiter>['error'];
    lastRefreshTimestamp: ReturnType<typeof useJupiter>['lastRefreshTimestamp'];
  };
  setUserSlippage: Dispatch<SetStateAction<number>>;
  setUserSlippageDynamic: Dispatch<SetStateAction<number>>;
  setUserSlippageMode: Dispatch<SetStateAction<SlippageMode>>;
}

export const SwapContext = createContext<ISwapContext | null>(null);

export class SwapTransactionTimeoutError extends Error {
  constructor() {
    super('Transaction timed-out');
  }
}

export function useSwapContext() {
  const context = useContext(SwapContext);
  if (!context) throw new Error('Missing SwapContextProvider');
  return context;
}

export const PRIORITY_NONE = 0; // No additional fee
export const PRIORITY_HIGH = 0.000_005; // Additional fee of 1x base fee
export const PRIORITY_TURBO = 0.000_5; // Additional fee of 100x base fee
export const PRIORITY_MAXIMUM_SUGGESTED = 0.01;

const INITIAL_FORM: IForm = {
  fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  toMint: WRAPPED_SOL_MINT.toString(),
  fromValue: '',
  toValue: '',
  slippageBps: Math.ceil(DEFAULT_SLIPPAGE_PCT * 100),
  userSlippageMode: SLIPPAGE_MODE_DEFAULT,
  dynamicSlippageBps: Math.ceil(
    DEFAULT_MAX_DYNAMIC_SLIPPAGE_PCT * 100
  ),
};

export const SwapContextProvider = (
  props: PropsWithChildren<
    IInit & {
      asLegacyTransaction: boolean;
      setAsLegacyTransaction: Dispatch<SetStateAction<boolean>>;
    }
  >
) => {
  const {
    displayMode,
    scriptDomain,
    asLegacyTransaction,
    setAsLegacyTransaction,
    formProps: originalFormProps,
    maxAccounts,
    children,
  } = props;
  const { screen } = useScreenState();
  const { isLoaded, getTokenInfo } = useTokenContext();
  const { wallet } = useWalletPassThrough();
  const { refresh: refreshAccount } = useAccounts();
  const { connection } = useConnection();
  const executeTransaction = useExecuteTransaction();
  const { data: referenceFees } = useReferenceFeesQuery();
  const { priorityLevel, modifyComputeUnitPriceAndLimit } =
    usePrioritizationFee();

  const walletPublicKey = useMemo(
    () => wallet?.adapter.publicKey?.toString(),
    [wallet?.adapter.publicKey]
  );
  const formProps: FormProps = useMemo(
    () => ({ ...INITIAL_FORM, ...originalFormProps }),
    [originalFormProps]
  );
  const localStoragePrefix =
    typeof window !== 'undefined' &&
    window.Jupiter &&
    window.Jupiter.localStoragePrefix
      ? window.Jupiter.localStoragePrefix
      : 'default-prefix';

  const [userSlippage, setUserSlippage] = useLocalStorage<number>(
    `${localStoragePrefix}-slippage`,
    props.defaultFixedSlippage || DEFAULT_SLIPPAGE_PCT
  );

  const [userSlippageDynamic, setUserSlippageDynamic] =
    useLocalStorage<number>(
      `${localStoragePrefix}-slippage-dynamic`,
      props.defaultDynamicSlippage ||
        DEFAULT_MAX_DYNAMIC_SLIPPAGE_PCT
    );

  const [userSlippageMode, setUserSlippageMode] =
    useLocalStorage<SlippageMode>(
      `${localStoragePrefix}-slippage-mode`,
      props.defaultSlippageMode || SLIPPAGE_MODE_DEFAULT
    );

  const [form, setForm] = useState<IForm>(() => {
    const getSlippageBps = (slippage: number) => Math.ceil(slippage * 100);

    return {
      fromMint: formProps.initialInputMint || INITIAL_FORM.fromMint,
      toMint: formProps.initialOutputMint || INITIAL_FORM.toMint,
      fromValue: formProps.initialFromValue || INITIAL_FORM.fromValue,
      toValue: formProps.initialToValue || INITIAL_FORM.toValue,
      slippageBps: getSlippageBps(userSlippage),
      dynamicSlippageBps: getSlippageBps(userSlippageDynamic),
      userSlippageMode,
    };
  });

  const [errors, setErrors] = useState<
    Record<string, { title: string; message: string }>
  >({});

  const fromTokenInfo = useMemo(() => {
    if (!isLoaded) return null;
    const tokenInfo = form.fromMint ? getTokenInfo(form.fromMint) : null;
    return tokenInfo;
  }, [form.fromMint, isLoaded, getTokenInfo]);

  const toTokenInfo = useMemo(() => {
    if (!isLoaded) return null;
    const tokenInfo = form.toMint ? getTokenInfo(form.toMint) : null;
    return tokenInfo;
  }, [form.toMint, getTokenInfo, isLoaded]);

  const isToPairFocused = useRef<boolean>(false);

  const swapMode = isToPairFocused.current
    ? SwapMode.ExactOut
    : SwapMode.ExactIn;

  // Set value given initial amount
  const setupInitialAmount = useCallback(() => {
    if (
      !formProps.initialAmount ||
      !fromTokenInfo ||
      !toTokenInfo
    )
      return;

    const toUiAmount = (mint: string) => {
      const tokenInfo = mint ? getTokenInfo(mint) : undefined;
      if (!tokenInfo) return;
      return String(
        fromLamports(
          JSBI.BigInt(formProps.initialAmount ?? 0),
          tokenInfo.decimals
        )
      );
    };

    if (swapMode === SwapMode.ExactOut) {
      setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          toValue: toUiAmount(prev.toMint) ?? '',
        }));
      }, 0);
    } else {
      setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          fromValue: toUiAmount(prev.fromMint) ?? '',
        }));
      }, 0);
    }
  }, [
    formProps.initialAmount,
    fromTokenInfo,
    getTokenInfo,
    swapMode,
    toTokenInfo,
  ]);

  useEffect(() => {
    setupInitialAmount();
  }, [formProps.initialAmount, setupInitialAmount]);

  // New useEffect to handle token changes
  // (Placeholder for any additional logic related to token changes)

  // We don't want to effect to keep trigger for fromValue and toValue
  const userInputChange = useMemo(() => {
    return swapMode === SwapMode.ExactOut
      ? form.toValue
      : form.fromValue;
  }, [form.fromValue, form.toValue, swapMode]);

  const jupiterParams: UseJupiterProps = useMemo(() => {
    const calculateAmount = () => {
      if (isToPairFocused.current === false) {
        // ExactIn
        if (
          !fromTokenInfo ||
          !form.fromValue ||
          !hasNumericValue(form.fromValue)
        ) {
          return JSBI.BigInt(0);
        }
        return JSBI.BigInt(
          new Decimal(form.fromValue)
            .mul(Math.pow(10, fromTokenInfo.decimals))
            .floor()
            .toFixed()
        );
      }

      // ExactOut
      if (
        !toTokenInfo ||
        !form.toValue ||
        !hasNumericValue(form.toValue)
      ) {
        return JSBI.BigInt(0);
      }
      return JSBI.BigInt(
        new Decimal(form.toValue)
          .mul(Math.pow(10, toTokenInfo.decimals))
          .floor()
          .toFixed()
      );
    };

    const amount = calculateAmount();

    return {
      amount,
      inputMint: form.fromMint
        ? new PublicKey(form.fromMint)
        : undefined,
      outputMint: form.toMint
        ? new PublicKey(form.toMint)
        : undefined,
      swapMode,
      slippageBps: form.slippageBps,
      maxAccounts,
    };
  }, [
    form.fromMint,
    form.toMint,
    form.fromValue,
    form.toValue,
    form.slippageBps,
    swapMode,
    maxAccounts,
    fromTokenInfo,
    toTokenInfo,
  ]);

  // Always call useJupiter with safe params
  const {
    quoteResponseMeta: ogQuoteResponseMeta,
    refresh,
    loading,
    error,
    lastRefreshTimestamp,
    fetchSwapTransaction,
  } = useJupiter(jupiterParams);

  const [quoteResponseMeta, setQuoteResponseMeta] =
    useState<QuoteResponseMeta | null>(null);
  const [txStatus, setTxStatus] =
    useState<ISwapContext['swapping']['txStatus']>(undefined);
  const [lastSwapResult, setLastSwapResult] =
    useState<ISwapContext['lastSwapResult']>(null);

  useEffect(() => {
    if (!ogQuoteResponseMeta) {
      setQuoteResponseMeta(null);
      return;
    }
    // the UI sorts the best route depending on ExactIn or ExactOut
    setQuoteResponseMeta(ogQuoteResponseMeta);
  }, [ogQuoteResponseMeta, swapMode]);

  useEffect(() => {
    if (!form.fromValue && !quoteResponseMeta) {
      setForm((prev) => ({
        ...prev,
        fromValue: '',
        toValue: '',
      }));
      return;
    }

    setForm((prev) => {
      const newValue = { ...prev };

      if (!fromTokenInfo || !toTokenInfo) return prev;

      let { inAmount, outAmount } = quoteResponseMeta?.quoteResponse || {};
      if (swapMode === SwapMode.ExactIn) {
        newValue.toValue = outAmount
          ? new Decimal(outAmount.toString())
              .div(10 ** toTokenInfo.decimals)
              .toFixed(6) // Ensuring 6 decimal places
          : '';
      } else {
        newValue.fromValue = inAmount
          ? new Decimal(inAmount.toString())
              .div(10 ** fromTokenInfo.decimals)
              .toFixed(6) // Ensuring 6 decimal places
          : '';
      }
      return newValue;
    });
  }, [
    form.fromValue,
    fromTokenInfo,
    quoteResponseMeta,
    swapMode,
    toTokenInfo,
  ]);

  const onSubmitWithIx = useCallback(
    (swapResult: SwapResult) => {
      try {
        if ('error' in swapResult) throw swapResult.error;

        if ('txid' in swapResult) {
          console.log({ swapResult });
          setTxStatus((prev) => ({
            txid: swapResult.txid,
            status: 'success',
            quotedDynamicSlippageBps: prev?.quotedDynamicSlippageBps,
          }));
          setLastSwapResult({
            swapResult,
            quoteResponseMeta,
          });
        }
      } catch (error) {
        console.log('Swap error', error);
        setTxStatus((prev) => ({
          txid: '',
          status: 'fail',
          quotedDynamicSlippageBps:
            prev?.quotedDynamicSlippageBps,
        }));
        setLastSwapResult({
          swapResult,
          quoteResponseMeta,
        });
      }
    },
    [quoteResponseMeta]
  );

    const onRequestIx = useCallback(
    async (): Promise<IOnRequestIxCallback> => {
      if (!walletPublicKey || !wallet?.adapter)
        throw new Error('Missing wallet');
      if (!quoteResponseMeta)
        throw new Error('Missing quote');

      const inputMint = quoteResponseMeta?.quoteResponse.inputMint;
      const outputMint = quoteResponseMeta?.quoteResponse.outputMint;

      // A direct reference from https://station.jup.ag/docs/apis/swap-api#instructions-instead-of-transaction
      const fetchWithRetry = async (attempt = 1): Promise<any> => {
        try {
          const response = await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quoteResponse: quoteResponseMeta.original,
              userPublicKey: walletPublicKey,
              dynamicComputeUnitLimit: true,
            }),
          });
          return await response.json();
        } catch (error) {
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return fetchWithRetry(attempt + 1);
          }
          throw error;
        }
      };

      const instructions: IOnRequestIxCallback['instructions'] = await fetchWithRetry();

      if (!instructions || instructions.error) {
        setErrors({
          'missing-instructions': {
            title: 'Missing instructions',
            message: 'Failed to get swap instructions',
          },
        });

        console.log(
          'Failed to get swap instructions: ',
          instructions
        );
        throw new Error('Failed to get swap instructions');
      }

      const [sourceAddress, destinationAddress] = [inputMint, outputMint].map(
        (mint) =>
          getAssociatedTokenAddressSync(
            new PublicKey(mint),
            new PublicKey(walletPublicKey)
          )
      );

      return {
        meta: {
          sourceAddress,
          destinationAddress,
          quoteResponseMeta,
        },
        instructions,
        onSubmitWithIx,
      };
    },
    [
      walletPublicKey,
      wallet?.adapter,
      quoteResponseMeta,
      onSubmitWithIx,
    ]
  );

  const onSubmit = useCallback(async () => {
    if (
      !walletPublicKey ||
      !wallet?.adapter ||
      !quoteResponseMeta
    ) {
      return null;
    }

    let intervalId: NodeJS.Timer | undefined;

    const swapResult = new Promise<SwapResult | null>(
      async (res, rej) => {
        if (!wallet.adapter.publicKey) return null;

        setTxStatus({
          txid: '',
          status: 'loading',
          quotedDynamicSlippageBps: '',
        });

        const swapTransactionResponse =
          await fetchSwapTransaction({
            quoteResponseMeta,
            userPublicKey:
              wallet.adapter.publicKey,
            prioritizationFeeLamports: 1, // 1 is meaningless, since we append the fees ourselves in executeTransaction
            wrapUnwrapSOL: true,
            allowOptimizedWrappedSolTokenAccount: false,
            dynamicSlippage:
              form.userSlippageMode === 'DYNAMIC'
                ? { maxBps: form.dynamicSlippageBps }
                : undefined,
          });

        if ('error' in swapTransactionResponse) {
          console.error(
            'Error in swapTransactionResponse',
            swapTransactionResponse.error
          );
        } else {
          modifyComputeUnitPriceAndLimit(
            swapTransactionResponse.swapTransaction,
            {
              referenceFee: (() => {
                if (
                  !referenceFees?.jup.m ||
                  !referenceFees?.jup.h ||
                  !referenceFees?.jup.vh
                ) {
                  return referenceFees?.swapFee;
                }

                if (priorityLevel === 'MEDIUM')
                  return referenceFees.jup.m;
                if (priorityLevel === 'HIGH')
                  return referenceFees.jup.h;
                if (priorityLevel === 'VERY_HIGH')
                  return referenceFees.jup.vh;
              })(),
            }
          );

          const { inputMint, outputMint } =
            quoteResponseMeta.quoteResponse;
          const {
            destinationAddress,
            sourceAddress,
          } = await fetchSourceAddressAndDestinationAddress({
            connection,
            inputMint,
            outputMint,
            userPublicKey:
              wallet.adapter.publicKey!,
          });

          const result = await executeTransaction(
            swapTransactionResponse.swapTransaction,
            {
              blockhash:
                swapTransactionResponse.blockhash,
              lastValidBlockHeight:
                swapTransactionResponse.lastValidBlockHeight,
              skipPreflight: true,
            },
            {
              onPending: () => {
                setTxStatus({
                  txid: '',
                  status: 'pending-approval',
                  quotedDynamicSlippageBps:
                    swapTransactionResponse
                      .dynamicSlippageReport
                      ?.slippageBps?.toString(),
                });
              },
              onSending: () => {
                setTxStatus({
                  txid: '',
                  status: 'sending',
                  quotedDynamicSlippageBps:
                    swapTransactionResponse
                      .dynamicSlippageReport
                      ?.slippageBps?.toString(),
                });
              },
              onProcessed: () => {
                // Not using processed for now
              },
              onSuccess: (
                txid,
                transactionResponse
              ) => {
                setTxStatus({
                  txid,
                  status: 'success',
                  quotedDynamicSlippageBps:
                    swapTransactionResponse
                      .dynamicSlippageReport
                      ?.slippageBps?.toString(),
                });

                const [
                  sourceTokenBalanceChange,
                  destinationTokenBalanceChange,
                ] =
                  getTokenBalanceChangesFromTransactionResponse({
                    txid,
                    inputMint,
                    outputMint,
                    user:
                      wallet.adapter.publicKey!,
                    sourceAddress,
                    destinationAddress,
                    transactionResponse,
                    hasWrappedSOL: false,
                  });

                setLastSwapResult({
                  swapResult: {
                    txid,
                    inputAddress: inputMint,
                    outputAddress: outputMint,
                    inputAmount:
                      sourceTokenBalanceChange,
                    outputAmount:
                      destinationTokenBalanceChange,
                  },
                  quoteResponseMeta:
                    quoteResponseMeta,
                });

                return res({
                  txid,
                  inputAddress: inputMint,
                  outputAddress: outputMint,
                  inputAmount:
                    sourceTokenBalanceChange,
                  outputAmount:
                    destinationTokenBalanceChange,
                });
              },
            }
          );

          if ('transactionResponse' in result === false) {
            console.log(result);

            setLastSwapResult({
              swapResult: {
                error:
                  'error' in result
                    ? result.error
                    : undefined,
              },
              quoteResponseMeta: quoteResponseMeta,
            });

            setTxStatus({
              txid: result.txid || '',
              status:
                'error' in result &&
                result.error?.message.includes(
                  'expired'
                )
                  ? 'timeout'
                  : 'fail',
              quotedDynamicSlippageBps:
                swapTransactionResponse
                  .dynamicSlippageReport
                  ?.slippageBps?.toString(),
            });

            return rej(null);
          }
        }
      }
    )
      .catch((result: SwapResult) => {
        console.log(result);
        return null;
      })
      .finally(() => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      });

    return swapResult;
  }, [
    walletPublicKey,
    wallet?.adapter,
    quoteResponseMeta,
    fetchSwapTransaction,
    form.userSlippageMode,
    form.dynamicSlippageBps,
    modifyComputeUnitPriceAndLimit,
    connection,
    executeTransaction,
    referenceFees?.jup.m,
    referenceFees?.jup.h,
    referenceFees?.jup.vh,
    referenceFees?.swapFee,
    priorityLevel,
  ]);

  const reset = useCallback(
    ({ resetValues } = { resetValues: false }) => {
      if (resetValues) {
        setForm(INITIAL_FORM);
        setupInitialAmount();
      } else {
        setForm((prev) => ({ ...prev, toValue: '' }));
      }

      setQuoteResponseMeta(null);
      setErrors({});
      setLastSwapResult(null);
      setTxStatus(undefined);
      refreshAccount();
    },
    [refreshAccount, setupInitialAmount]
  );

  // onFormUpdate callback
  useEffect(() => {
    if (typeof window.Jupiter.onFormUpdate === 'function') {
      window.Jupiter.onFormUpdate(form);
    }
  }, [form]);

  // onScreenUpdate callback
  useEffect(() => {
    if (typeof window.Jupiter.onScreenUpdate === 'function') {
      window.Jupiter.onScreenUpdate(screen);
    }
  }, [screen]);

  // Prepare the provider value with proper memoization
  const value: ISwapContext = useMemo(
    () => ({
      form,
      setForm,
      isToPairFocused,
      errors,
      setErrors,
      fromTokenInfo,
      toTokenInfo,
      quoteResponseMeta,
      setQuoteResponseMeta,
      onSubmit,
      onRequestIx,
      lastSwapResult,
      reset,

      displayMode,
      formProps,
      scriptDomain,
      swapping: {
        txStatus,
      },
      jupiter: {
        asLegacyTransaction,
        setAsLegacyTransaction,
        quoteResponseMeta,
        loading,
        refresh,
        error,
        lastRefreshTimestamp,
      },
      setUserSlippage,
      setUserSlippageDynamic,
      setUserSlippageMode,
    }),
    [
      form,
      errors,
      fromTokenInfo,
      toTokenInfo,
      quoteResponseMeta,
      lastSwapResult,
      txStatus,
      loading,
      refresh,
      error,
      lastRefreshTimestamp,
      onSubmit,
      onRequestIx,
      reset,
      asLegacyTransaction,
      setAsLegacyTransaction,
      setUserSlippage,
      setUserSlippageDynamic,
      setUserSlippageMode,
      displayMode,
      formProps,
      scriptDomain
    ]
  );

  return (
    <SwapContext.Provider value={value}>
      {children}
    </SwapContext.Provider>
  );
};