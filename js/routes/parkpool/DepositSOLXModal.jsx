/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { Button, Modal, notification } from "antd";
import styled from "@emotion/styled";
import { useContractReader } from "eth-hooks";
import { useDebounce } from "../../hooks";
import { BigNumber, ethers } from "ethers";
import { logTransactionUpdate } from "../../utils/evm-utils";
import { bigNumberFromFloat, withDecimals } from "../../utils/big-number";

const Note = styled.div({
  fontStyle: "italic",
  color: "#acacac",
  fontSize: 13,
  textAlign: "left",
});

const Input = styled.input(({ disabled }) => ({
  border: `1px solid #686df1`,
  borderRadius: 4,
  padding: `4px 10px`,
  color: disabled ? `#cccccc` : "#333333",
  // background: "transparent",
  background: disabled
    ? `rgba(255, 255, 255, 0.25)`
    : // : `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)) !important;`,
      `white`,
  fontSize: 20,
  "&:focus": {
    border: `1px solid #686df1`,
    outline: "none",
  },
  width: "100%",
  textAlign: "left",
  // boxShadow: disabled ? "none" : `rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px`,
  // boxShadow: `rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px`,
}));

const InputError = styled.div({
  color: "red",
});

const ApproveButton = ({ disabled, writeContracts, tx }) => {
  const [txInProgress, setTxInProgress] = useState(false);
  const [approved, setApproved] = useState(false);
  const approvedDebounced = useDebounce(approved, 300);

  useEffect(() => {
    if (approvedDebounced) {
      setApproved(false);
      // Display notification for successful approval
      notification.success({
        message: "Approve success",
        description: `You can click Deposit now`,
        placement: "bottomRight",
      });
    }
  }, [approvedDebounced]);

  const onClick = () => {
    setTxInProgress(true);

    if (!writeContracts.SoleraX) {
      console.warn(`writeContracts.SoleraX not defined`);
      setTxInProgress(false);

      notification.warn({
        message: "Wrong network?",
        description: `SoleraX contract not found - are you connected to the Binance Smart Chain?`,
        placement: "bottomRight",
      });

      return;
    }

    tx(writeContracts.SoleraX.approve(writeContracts.ParkPool.address, ethers.constants.MaxUint256), update => {
      console.log("📡 Approve Transaction Update:", update);
      setTxInProgress(false);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setApproved(true);
        logTransactionUpdate(update, "approve()");
      }
    });
  };

  return (
    <Button
      loading={txInProgress}
      type={"primary"}
      shape="round"
      onClick={onClick}
      disabled={disabled}
      style={{ minWidth: 130 }}
    >
      Approve SOLX
    </Button>
  );
};

const DepositButton = ({ solxToDeposit, disabled, writeContracts, tx, setDepositDone }) => {
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

    const solxToDepositBN = bigNumberFromFloat(parseFloat(solxToDeposit));

    tx(writeContracts.ParkPool.deposit(solxToDepositBN), update => {
      console.log("📡 Deposit SOLX Transaction Update:", update);
      setTxInProgress(false);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setDepositDone(true);
        logTransactionUpdate(update, "deposit()");

        notification.success({
          message: "SOLX deposited",
          description: `You just deposited ${withDecimals(solxToDepositBN)} SOLX`,
          placement: "bottomRight",
        });
      }
    });
  };

  return (
    <Button
      loading={txInProgress}
      type={"primary"}
      shape="round"
      onClick={onClick}
      disabled={disabled}
      style={{ minWidth: 130 }}
    >
      Deposit SOLX
    </Button>
  );
};

const DepositSOLXModal = ({ onClose, readContracts, address, tx, writeContracts }) => {
  const solxAllowance = useContractReader(readContracts, "SoleraX", "allowance", [
    address,
    readContracts.ParkPool?.address,
  ]);
  // console.log("solxAllowance", solxAllowance?.toString());
  const approveEnabled = solxAllowance?.toString() === "0";

  const [solxToDeposit, setSolxToDeposit] = useState("");
  const [solxToDepositError, setSolxToDepositError] = useState("");

  const [depositDone, setDepositDone] = useState(false);

  const depositEnabled = solxAllowance && solxAllowance.gt(BigNumber.from(0)) && parseFloat(solxToDeposit) > 0;

  const updateSolx = ev => {
    const val = ev.target.value.replace(",", ".").replace(/[^0-9.]/, "");
    setSolxToDeposit(val);

    if (val === "") {
      setSolxToDepositError("Required");
    } else if (parseFloat(val) === 0) {
      setSolxToDepositError("Must be greater than 0");
    } else {
      setSolxToDepositError("");
    }
  };

  return (
    <Modal
      visible
      title={"Deposit SOLX into Park Pool"}
      onCancel={onClose}
      footer={<Note>Park Pool is your entry into the photovoltaic park</Note>}
    >
      {depositDone && (
        <>
          <h2>Deposit successful</h2>
          <p>Your deposit share of the pool has increased!</p>
        </>
      )}
      {!depositDone && (
        <>
          <h4>
            PLEAS READ CAREFULLY! <br /> The SOLX you deposit in the pool is used to purchase photovoltaic panels in the
            photovoltaic park. This means you won't be able to get back the SOLX that you deposit.
          </h4>
          <div>
            <label>How much SOLX do you want to deposit?</label>
            <Input value={solxToDeposit} onChange={updateSolx} />
            {solxToDepositError && <InputError>{solxToDepositError}</InputError>}
          </div>

          <div css={{ margin: "40px auto 0 auto", display: "flex", alignItems: "flex-start" }}>
            <ApproveButton disabled={!approveEnabled} {...{ writeContracts, tx }} />
            <div css={{ flex: "1 1 auto" }}>&nbsp;</div>
            <DepositButton disabled={!depositEnabled} {...{ solxToDeposit, writeContracts, tx, setDepositDone }} />
          </div>
        </>
      )}
    </Modal>
  );
};

export default DepositSOLXModal;
