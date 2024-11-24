import { Address } from 'viem';
import { type Chain } from 'viem/chains';

export type TokenInfo = {
  symbol: string;
  decimals: number;
  icon: string;
  networks: {
    chain: Chain;
    address: string;
  }[];
};

export type TokenBalanceRaw = {
  address: string;
  balance: string;
};

export type TokenBalanceResponse = {
  tokens: TokenBalanceRaw[];
};

export type TokenBalance = {
  token: TokenInfo;
  balance: string;
  chain: number;
};

export type SignerType = 'passkey' | 'localEOA' | 'biconomyEOA';

export type WalletVendor = 'zerodev' | 'biconomy';

export type WalletImplementation = {
  vendor: WalletVendor;
  description: string;
  icon: string;
};

export const WALLET_IMPLEMENTATIONS: Record<WalletVendor, WalletImplementation> = {
  zerodev: {
    vendor: 'zerodev',
    description: 'Industry standard smart accounts',
    icon: '/vendors/zerodev.png',
  },
  biconomy: {
    vendor: 'biconomy',
    description: 'Optimized for token transfers',
    icon: '/vendors/biconomy.png',
  },
};

export type Wallet = {
  address: Address;
  label: string;
  username: string;
  type: SignerType;
  vendor: WalletVendor;
};

export type CreateWalletFormData = {
  label: string;
  signerType: SignerType;
  vendor: WalletVendor;
};

export type TokenTransfer = {
  token: TokenInfo;
  chain: Chain;
  from: Address;
  to: Address;
  value: string;
  timestamp: number;
  hash: `0x${string}`;
  isIncoming: boolean;
};
