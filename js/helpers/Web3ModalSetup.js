import Web3Modal from "web3modal";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { INFURA_ID, NETWORKS } from "../constants";

// https://gist.github.com/carletex/48b2b019b35a9ff6a0cd8fc087e8b986

// Trust doesn't support WalletConnect v1 anymore
// https://community.trustwallet.com/t/wallet-connect-trust-wallet-connection-issues/756942/13

// https://cloud.walletconnect.com/app/project?uuid=f0b925f9-778e-4fa3-9fa0-fd25465aa5e7
// login with SoleraX wallet e711
const WALLETCONNECT_PROJECT_ID = "cbceab5b066e1b4e726aadb992240776";

// https://docs.walletconnect.com/2.0/web/walletConnectModal/modal/options
// https://github.com/WalletConnect/web3modal-examples/blob/main/walletconnect-modal-ethereum-provider-react/src/pages/index.jsx
// const web3ModalSetup = () => {
//   return EthereumProvider.init({
//     projectId: WALLETCONNECT_PROJECT_ID,
//     // chains: [NETWORKS.mainnet.chainId, NETWORKS.testnet.chainId, NETWORKS.localhost.chainId], // required
//     chains: [NETWORKS.mainnet.chainId], // required
//     showQrModal: true, // requires @walletconnect/modal
//     rpc: {
//       [NETWORKS.mainnet.chainId]: NETWORKS.mainnet.rpcUrl,
//       [NETWORKS.testnet.chainId]: NETWORKS.testnet.rpcUrl,
//       [NETWORKS.localhost.chainId]: NETWORKS.localhost.rpcUrl,
//     },
//     qrModalOptions: {
//       explorerRecommendedWalletIds: [
//         // wallets list: https://walletconnect.com/explorer?type=wallet&chains=eip155%3A1
//         "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // trust
//         "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // metamask
//       ],
//     },
//   });
// };

/**
 * Setup a popup with link to connect to MetaMask and TrustWallet
 */
const web3ModalSetup = () => {
  return new Web3Modal({
    // network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
    cacheProvider: true, // optional
    theme: "dark", // optional. Change to "dark" for a dark theme.
    providerOptions: {
      "custom-walletconnect": {
        display: {
          logo: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyYWRpYWxHcmFkaWVudCBpZD0iYSIgY3g9IjAlIiBjeT0iNTAlIiByPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1ZDlkZjYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDZmZmYiLz48L3JhZGlhbEdyYWRpZW50PjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0ibTI1NiAwYzE0MS4zODQ4OTYgMCAyNTYgMTE0LjYxNTEwNCAyNTYgMjU2cy0xMTQuNjE1MTA0IDI1Ni0yNTYgMjU2LTI1Ni0xMTQuNjE1MTA0LTI1Ni0yNTYgMTE0LjYxNTEwNC0yNTYgMjU2LTI1NnoiIGZpbGw9InVybCgjYSkiLz48cGF0aCBkPSJtNjQuNjkxNzU1OCAzNy43MDg4Mjk4YzUxLjUzMjgwNzItNTAuMjc4NDM5NyAxMzUuMDgzOTk0Mi01MC4yNzg0Mzk3IDE4Ni42MTY3OTkyIDBsNi4yMDIwNTcgNi4wNTEwOTA2YzIuNTc2NjQgMi41MTM5MjE4IDIuNTc2NjQgNi41ODk3OTQ4IDAgOS4xMDM3MTc3bC0yMS4yMTU5OTggMjAuNjk5NTc1OWMtMS4yODgzMjEgMS4yNTY5NjE5LTMuMzc3MSAxLjI1Njk2MTktNC42NjU0MjEgMGwtOC41MzQ3NjYtOC4zMjcwMjA1Yy0zNS45NTA1NzMtMzUuMDc1NDk2Mi05NC4yMzc5NjktMzUuMDc1NDk2Mi0xMzAuMTg4NTQ0IDBsLTkuMTQwMDI4MiA4LjkxNzU1MTljLTEuMjg4MzIxNyAxLjI1Njk2MDktMy4zNzcxMDE2IDEuMjU2OTYwOS00LjY2NTQyMDggMGwtMjEuMjE1OTk3My0yMC42OTk1NzU5Yy0yLjU3NjY0MDMtMi41MTM5MjI5LTIuNTc2NjQwMy02LjU4OTc5NTggMC05LjEwMzcxNzd6bTIzMC40OTM0ODUyIDQyLjgwODkxMTcgMTguODgyMjc5IDE4LjQyMjcyNjJjMi41NzY2MjcgMi41MTM5MTAzIDIuNTc2NjQyIDYuNTg5NzU5My4wMDAwMzIgOS4xMDM2ODYzbC04NS4xNDE0OTggODMuMDcwMzU4Yy0yLjU3NjYyMyAyLjUxMzk0MS02Ljc1NDE4MiAyLjUxMzk2OS05LjMzMDg0LjAwMDA2Ni0uMDAwMDEtLjAwMDAxLS4wMDAwMjMtLjAwMDAyMy0uMDAwMDMzLS4wMDAwMzRsLTYwLjQyODI1Ni01OC45NTc0NTFjLS42NDQxNi0uNjI4NDgxLTEuNjg4NTUtLjYyODQ4MS0yLjMzMjcxIDAtLjAwMDAwNC4wMDAwMDQtLjAwMDAwOC4wMDAwMDctLjAwMDAxMi4wMDAwMTFsLTYwLjQyNjk2ODMgNTguOTU3NDA4Yy0yLjU3NjYxNDEgMi41MTM5NDctNi43NTQxNzQ2IDIuNTEzOTktOS4zMzA4NDA4LjAwMDA5Mi0uMDAwMDE1MS0uMDAwMDE0LS4wMDAwMzA5LS4wMDAwMjktLjAwMDA0NjctLjAwMDA0NmwtODUuMTQzODY3NzQtODMuMDcxNDYzYy0yLjU3NjYzOTI4LTIuNTEzOTIxLTIuNTc2NjM5MjgtNi41ODk3OTUgMC05LjEwMzcxNjNsMTguODgyMzEyNjQtMTguNDIyNjk1NWMyLjU3NjYzOTMtMi41MTM5MjIyIDYuNzU0MTk5My0yLjUxMzkyMjIgOS4zMzA4Mzk3IDBsNjAuNDI5MTM0NyA1OC45NTgyNzU4Yy42NDQxNjA4LjYyODQ4IDEuNjg4NTQ5NS42Mjg0OCAyLjMzMjcxMDMgMCAuMDAwMDA5NS0uMDAwMDA5LjAwMDAxODItLjAwMDAxOC4wMDAwMjc3LS4wMDAwMjVsNjAuNDI2MTA2NS01OC45NTgyNTA4YzIuNTc2NTgxLTIuNTEzOTggNi43NTQxNDItMi41MTQwNzQzIDkuMzMwODQtLjAwMDIxMDMuMDAwMDM3LjAwMDAzNTQuMDAwMDcyLjAwMDA3MDkuMDAwMTA3LjAwMDEwNjNsNjAuNDI5MDU2IDU4Ljk1ODM1NDhjLjY0NDE1OS42Mjg0NzkgMS42ODg1NDkuNjI4NDc5IDIuMzMyNzA5IDBsNjAuNDI4MDc5LTU4Ljk1NzE5MjVjMi41NzY2NC0yLjUxMzkyMzEgNi43NTQxOTktMi41MTM5MjMxIDkuMzMwODM5IDB6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk4IDE2MCkiLz48L2c+PC9zdmc+",
          name: "WalletConnect",
          description: "Scan with WalletConnect to connect",
        },
        options: {
          // Get the project ID from https://cloud.walletconnect.com/
          projecId: WALLETCONNECT_PROJECT_ID,
          chains: [NETWORKS.mainnet.chainId],
          rpc: {
            [NETWORKS.mainnet.chainId]: NETWORKS.mainnet.rpcUrl,
            [NETWORKS.testnet.chainId]: NETWORKS.testnet.rpcUrl,
            [NETWORKS.localhost.chainId]: NETWORKS.localhost.rpcUrl,
          },
        },
        package: EthereumProvider,
        connector: async (ProviderPackage, options) => {
          const provider = await ProviderPackage.init({
            projectId: options.projecId,
            chains: options.chains,
            rpc: options.rpc,
            showQrModal: true,
          });
          await provider.enable();
          return provider;
        },
      },
      // walletconnect: {
      //   package: EthereumProvider, // required
      //   options: {
      //     infuraId: INFURA_ID,
      //     rpc: {
      //       // [network.chainId]: network.rpcUrl,
      //       [NETWORKS.mainnet.chainId]: NETWORKS.mainnet.rpcUrl,
      //       [NETWORKS.testnet.chainId]: NETWORKS.testnet.rpcUrl,
      //       [NETWORKS.localhost.chainId]: NETWORKS.localhost.rpcUrl,
      //     },
      //     qrcodeModalOptions: {
      //       mobileLinks: ["trust", "metamask"],
      //     },
      //   },
      // },
      // display: {
      //   description: "Scan with a wallet to connect",
      // },
    },
  });
};

export default web3ModalSetup;
