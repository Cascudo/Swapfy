// Enhanced ScreenProvider.tsx
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState, useRef } from 'react';

export type Screens = 'Initial' | 'Confirmation' | 'Swapping' | 'Success' | 'Error';

interface TransactionState {
  attemptCount: number;
  lastSignature?: string;
  isProcessing: boolean;
  lastAttemptTime?: number;
}

export interface ScreenProvider {
  screen: Screens;
  setScreen: Dispatch<SetStateAction<Screens>>;
  transactionState: TransactionState;
  setTransactionState: Dispatch<SetStateAction<TransactionState>>;
  resetTransaction: () => void;
  canAttemptNewTransaction: () => boolean;
}

const INITIAL_TRANSACTION_STATE: TransactionState = {
  attemptCount: 0,
  isProcessing: false,
};

export const ScreenStateContext = createContext<ScreenProvider>({
  screen: 'Initial',
  setScreen: () => {},
  transactionState: INITIAL_TRANSACTION_STATE,
  setTransactionState: () => {},
  resetTransaction: () => {},
  canAttemptNewTransaction: () => true,
});

export function useScreenState(): ScreenProvider {
  return useContext(ScreenStateContext);
}

export const ScreenProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screens>('Initial');
  const [transactionState, setTransactionState] = useState<TransactionState>(INITIAL_TRANSACTION_STATE);
  
  const resetTransaction = () => {
    setTransactionState(INITIAL_TRANSACTION_STATE);
  };

  const canAttemptNewTransaction = () => {
    if (transactionState.isProcessing) return false;
    
    // Prevent new attempts if we've tried recently
    if (transactionState.lastAttemptTime) {
      const timeSinceLastAttempt = Date.now() - transactionState.lastAttemptTime;
      if (timeSinceLastAttempt < 5000) return false; // 5 second cooldown
    }

    // Max 3 attempts per transaction
    if (transactionState.attemptCount >= 3) return false;

    return true;
  };

  return (
    <ScreenStateContext.Provider 
      value={{ 
        screen, 
        setScreen, 
        transactionState, 
        setTransactionState,
        resetTransaction,
        canAttemptNewTransaction,
      }}
    >
      {children}
    </ScreenStateContext.Provider>
  );
};