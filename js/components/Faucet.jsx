import { SendOutlined } from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";
import React, { useCallback, useState, useEffect } from "react";
import Blockies from "react-blockies";
import { Transactor } from "../helpers";
import Wallet from "./Wallet";
import { useStaticJsonRPC } from "../hooks";
import { NETWORKS } from "../constants";

const { utils } = require("ethers");

// improved a bit by converting address to ens if it exists
// added option to directly input ens name
// added placeholder option

/*
  ~ What it does? ~

  Displays a local faucet to send ETH to given address, also wallet is provided

  ~ How can I use? ~

  <Faucet
    price={price}
    localProvider={localProvider}
    ensProvider={mainnetProvider}
    placeholder={"Send local faucet"}
  />

  ~ Features ~

  - Provide price={price} of ether and convert between USD and ETH in a wallet
  - Provide localProvider={localProvider} to be able to send ETH to given address
  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth") or you can enter directly ENS name instead of address
              works both in input field & wallet
  - Provide placeholder="Send local faucet" value for the input
*/

export default function Faucet(props) {
  const localProvider = useStaticJsonRPC([NETWORKS.localhost.rpcUrl]);

  const [address, setAddress] = useState();
  const [faucetAddress, setFaucetAddress] = useState();

  const { placeholder, onChange } = props;

  useEffect(() => {
    const getFaucetAddress = async () => {
      if (localProvider) {
        const _faucetAddress = await localProvider.listAccounts();
        setFaucetAddress(_faucetAddress[0]);
      }
    };
    getFaucetAddress();
  }, [localProvider]);

  let blockie;
  if (address && typeof address.toLowerCase === "function") {
    blockie = <Blockies seed={address.toLowerCase()} size={8} scale={4} />;
  } else {
    blockie = <div />;
  }

  const updateAddress = useCallback(
    async newValue => {
      if (typeof newValue !== "undefined" && utils.isAddress(newValue)) {
        setAddress(newValue);
      }
    },
    [onChange],
  );

  const tx = Transactor(localProvider);

  return (
    <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
      <Input
        size="large"
        placeholder={placeholder ? placeholder : "local faucet"}
        prefix={blockie}
        value={address}
        onChange={e => updateAddress(e.target.value)}
        suffix={
          <Tooltip title="Faucet: Send local ether to an address.">
            <Button
              onClick={() => {
                tx({
                  to: address,
                  value: utils.parseEther("0.5"),
                });
                setAddress("");
              }}
              shape="circle"
              icon={<SendOutlined />}
            />
            {/*<Wallet*/}
            {/*  color="#888888"*/}
            {/*  provider={localProvider}*/}
            {/*  ensProvider={ensProvider}*/}
            {/*  price={price}*/}
            {/*  address={faucetAddress}*/}
            {/*/>*/}
          </Tooltip>
        }
      />
    </div>
  );
}
