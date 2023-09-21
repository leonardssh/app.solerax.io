/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import { Button, notification } from "antd";
import { useContractReader } from "eth-hooks";
import { bigNumberFromFloat, withDecimals } from "../../utils/big-number";
import { BigNumber } from "ethers";
import { logTransactionUpdate } from "../../utils/evm-utils";

const ClaimButton = ({ disabled, tx, writeContracts }) => {
  const [txInProgress, setTxInProgress] = useState(false);

  const onClick = () => {
    setTxInProgress(true);

    if (!writeContracts.ParkPool) {
      console.warn(`writeContracts.ParkPool not defined`);
      setTxInProgress(false);

      notification.warn({
        message: "Wrong network?",
        description: `ParkPool contract not found - are you connected to the Binance Smart Chain?`,
        placement: "bottomRight",
      });

      return;
    }

    tx(writeContracts.ParkPool.claimReward(), update => {
      console.log("📡 claimReward Transaction Update:", update);
      setTxInProgress(false);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        logTransactionUpdate(update, "claimReward()");

        notification.success({
          message: "BNB claimed",
          description: `You just claimed your BNB rewards`,
          placement: "bottomRight",
        });
      }
    });
  };

  return (
    <Button
      loading={txInProgress}
      type={"primary"}
      style={{ minWidth: 130, verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
      shape="round"
      size="large"
      onClick={onClick}
      disabled={disabled}
    >
      Claim BNB
    </Button>
  );
};

const ParkPoolClaim = ({ readContracts, address, tx, writeContracts }) => {
  const userRewards = useContractReader(readContracts, "ParkPool", "rewardsByAddress", [address]);

  if (!userRewards) {
    return null;
  }

  return (
    <div>
      <h2>Your rewards</h2>
      {userRewards && (
        <div>
          <div>Claimable now: {withDecimals(userRewards.claimable, 6)} BNB</div>
          <div>Already claimed: {withDecimals(userRewards.claimed, 6)} BNB</div>
        </div>
      )}
      <div css={{ marginTop: 20 }}>
        <ClaimButton
          {...{ tx, writeContracts }}
          disabled={!userRewards || userRewards.claimable.eq(BigNumber.from("0"))}
        />
        <Button
          key="viewAllDepositsButton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          href={"/parkpool/rewards"}
        >
          View all rewards
        </Button>
      </div>
    </div>
  );
};

export default ParkPoolClaim;
