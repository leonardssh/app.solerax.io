import React from "react";
import styled from "@emotion/styled";
import { useContractReader } from "eth-hooks";
import { withDecimals } from "../utils/big-number";
import SolxLogo from "../assets/solx-logo.png";
import MetaMaskLogo from "../assets/metamask.png";

const SolxTokenWrapper = styled.div({
  border: `1px solid #686df1`,
  borderRadius: 4,
  padding: `3px 7px`,
  display: "flex",
  alignItems: "center",
  img: {
    display: "flex",
  },
});

// Display the SOLX price and a MetaMask icon to add the token address to MetaMask
export const SolxToken = ({ solxAddress, readContracts }) => {
  const price = useContractReader(readContracts, "PublicSaleV2", "price");

  if (!price) {
    return null;
  }

  const onMetaMaskClick = async () => {
    if (typeof window["ethereum"] === "undefined") {
      console.log(`ethereum is undefined`);
      return;
    }

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: solxAddress,
            symbol: "SOLX",
            decimals: 18,
            // image: "http://", // A string url of the token logo
          },
        },
      });

      console.log("onMetaMaskClick: wasAdded = ", wasAdded);
    } catch (error) {
      console.log("onMetaMaskClick:", error);
    }
  };

  return (
    <SolxTokenWrapper>
      <img src={SolxLogo} width={16} style={{ marginRight: 7 }} alt={"SOLX logo"} />${withDecimals(price)}
      {solxAddress && (
        <a onClick={onMetaMaskClick}>
          <img src={MetaMaskLogo} width={16} style={{ marginLeft: 7 }} alt={"Add to MetaMask"} />
        </a>
      )}
    </SolxTokenWrapper>
  );
};
