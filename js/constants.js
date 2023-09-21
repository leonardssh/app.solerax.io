// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "7b0e75d38d424750b92791477924d133";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const ALCHEMY_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://" + (global.window ? window.location.hostname : "localhost") + ":8545",
  },
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 56,
    rpcUrl: `https://bsc-dataseed.binance.org`,
    // rpcUrl: `https://speedy-nodes-nyc.moralis.io/c4d8b3b5c218c03671fea11a/bsc/mainnet`,
    blockExplorer: "https://bscscan.com/",
    gasPrice: 5,
  },
  testnet: {
    name: "testnet",
    color: "#7003DD",
    chainId: 97,
    rpcUrl: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
    // rpcUrl: `https://speedy-nodes-nyc.moralis.io/c4d8b3b5c218c03671fea11a/bsc/testnet`,
    // rpcUrl: `wss://speedy-nodes-nyc.moralis.io/c4d8b3b5c218c03671fea11a/bsc/testnet/ws`,
    blockExplorer: "https://testnet.bscscan.com/",
    // faucet: "https://gitter.im/kovan-testnet/faucet", // https://faucet.kovan.network/
  },
};

export const CHAINS = {
  31337: "localhost",

  1: "Ethereum",
  56: "Binance Smart Chain",
  97: "Binance Smart Chain - Testnet",
  137: "Matic",
  250: "Fantom Opera",
  321: "Kucoin Community Chain",
  43114: "Avalanche",
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const COLOR = {
  white: "#fff",
  green: "#25cc9c",
};
