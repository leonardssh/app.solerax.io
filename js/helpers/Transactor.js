import { notification } from "antd";
import { ethers } from "ethers";

const DEBUG = true;

export default function Transactor(providerOrSigner, gasPrice, etherscan) {
  if (typeof providerOrSigner !== "undefined") {
    // eslint-disable-next-line consistent-return
    return async (tx, callback) => {
      let signer;
      let network;
      let provider;
      if (ethers.Signer.isSigner(providerOrSigner) === true) {
        provider = providerOrSigner.provider;
        signer = providerOrSigner;
        network = providerOrSigner.provider && (await providerOrSigner.provider.getNetwork());
      } else if (providerOrSigner._isProvider) {
        provider = providerOrSigner;
        signer = providerOrSigner.getSigner();
        // network = await providerOrSigner.getNetwork();
      }

      try {
        let result;
        if (tx instanceof Promise) {
          if (DEBUG) console.log("AWAITING TX", tx);
          result = await tx;
        } else {
          if (!tx.gasPrice) {
            tx.gasPrice = gasPrice || ethers.utils.parseUnits("4.1", "gwei");
          }
          if (!tx.gasLimit) {
            tx.gasLimit = ethers.utils.hexlify(120000);
          }
          if (DEBUG) console.log("RUNNING TX", tx);
          result = await signer.sendTransaction(tx);
        }
        if (DEBUG) console.log("RESULT:", result);

        notification.info({
          message: "Transaction sent",
          description: result.hash,
          placement: "bottomRight",
        });

        // on most networks BlockNative will update a transaction handler,
        // but locally we will set an interval to listen...
        // debugger;
        if (callback) {
          // const txResult = await tx;
          const listeningInterval = setInterval(async () => {
            console.log("CHECK IN ON THE TX", result, provider);
            // const currentTransactionReceipt = await provider.getTransactionReceipt(txResult.hash);
            const currentTransactionReceipt = await provider.getTransactionReceipt(result.hash);
            if (currentTransactionReceipt && currentTransactionReceipt.confirmations) {
              callback({ ...result, ...currentTransactionReceipt });
              clearInterval(listeningInterval);
            }
          }, 500);
        }

        if (typeof result.wait === "function") {
          await result.wait();
        }

        return result;
      } catch (e) {
        if (DEBUG) console.log(e);
        // Accounts for Metamask and default signer on all networks
        let message =
          e.data && e.data.message
            ? e.data.message
            : e.error && JSON.parse(JSON.stringify(e.error)).body
            ? JSON.parse(JSON.parse(JSON.stringify(e.error)).body).error.message
            : e.data
            ? e.data
            : JSON.stringify(e);
        if (!e.error && e.message && !e.message.includes("JSON-RPC")) {
          message = e.message;
        }

        console.log("Attempt to clean up:", message);
        try {
          let obj = JSON.parse(message);
          if (obj && obj.body) {
            let errorObj = JSON.parse(obj.body);
            if (errorObj && errorObj.error && errorObj.error.message) {
              message = errorObj.error.message;
            }
          }
        } catch (e) {
          //ignore
        }

        notification.error({
          message: "Transaction error",
          description: message,
        });
        if (callback && typeof callback === "function") {
          callback(e);
        }
      }
    };
  }
}
