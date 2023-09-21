/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import { Button, Input, notification } from "antd";
import styled from "@emotion/styled";
import { logTransactionUpdate } from "../../utils/evm-utils";
import { bigNumberFromFloat } from "../../utils/big-number";

const InputError = styled.div({
  color: "red",
});

const DepositParkReward = ({ tx, writeContracts }) => {
  const [txInProgress, setTxInProgress] = useState(false);

  const [bnbToDeposit, setBnbToDeposit] = useState("");
  const [bnbToDepositError, setBnbToDepositError] = useState("");
  const depositEnabled = parseFloat(bnbToDeposit) > 0 && !bnbToDepositError;

  const updateBNB = ev => {
    const val = ev.target.value.replace(",", ".").replace(/[^0-9.]/, "");
    setBnbToDeposit(val);

    if (val === "") {
      setBnbToDepositError("Required");
    } else if (parseFloat(val) === 0) {
      setBnbToDepositError("Must be greater than 0");
    } else {
      setBnbToDepositError("");
    }
  };

  const onDepositClick = () => {
    setTxInProgress(true);
    const bnbToDepositBN = bigNumberFromFloat(parseFloat(bnbToDeposit));

    tx(writeContracts.ParkPool?.depositReward({ value: bnbToDepositBN }), update => {
      console.log("📡 depositReward() update:", update);
      setTxInProgress(false);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        logTransactionUpdate(update, "depositReward()");

        notification.success({
          message: "Reward deposited",
          description: `You have deposited ${bnbToDeposit} BNB into the ParkPool contract`,
          placement: "bottomRight",
        });
      }
    });
  };

  return (
    <div css={{ marginBottom: 20 }}>
      <h3>Deposit reward</h3>
      <label>How much BNB do you want to deposit into the ParkPool contract for rewards?</label>
      <div css={{ display: "flex", alignItems: "center" }}>
        <div css={{ marginRight: 20 }}>
          <div css={{ maxWidth: 200 }}>
            <Input value={bnbToDeposit} onChange={updateBNB} />
          </div>
          {bnbToDepositError && <InputError>{bnbToDepositError}</InputError>}
        </div>
        <Button
          loading={txInProgress}
          type={"primary"}
          shape="round"
          onClick={onDepositClick}
          disabled={!depositEnabled}
        >
          Deposit BNB reward
        </Button>
      </div>
    </div>
  );
};

export default DepositParkReward;
