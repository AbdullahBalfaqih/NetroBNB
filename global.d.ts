declare global {
  namespace JSX {
    interface IntrinsicElements {
      "appkit-button": any;
      "appkit-network-button": any;
    }
  }

  interface Window {
    ethereum?: any;
    solana?: any;
    bitget?: any;
    bitkeep?: any;
    phantom?: any;
  }
}

export {};
