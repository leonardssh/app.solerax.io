/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { Button, Modal, notification, Popover, Spin } from "antd";
import styled from "@emotion/styled";
import { useContractReader } from "eth-hooks";
import { useDebounce } from "../../../hooks";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { bigNumberFromFloat, withDecimals } from "../../../utils/big-number";
import SolxLogo from "../../../assets/solx-logo.png";
import BusdLogo from "../busd.png";
import { logTransactionUpdate } from "../../../utils/evm-utils";
import { calculateFee, ONE_ETHER, stringToBigNumber } from "../exchange-utils";
import { ethers } from "ethers";

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

const InputToken = styled.div({
  position: "absolute",
  paddingLeft: 7,
  paddingRight: 5,
  right: 2,
  top: 1,
  display: "flex",
  alignItems: "center",
  color: "#333",
  background: "#efefef",
  height: 39,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
});

const HowSellingWorks = ({ saleFeePercent }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={
        <div>
          <p>In order to sell SOLX you create an offer that gets listed on the Exchange page.</p>
          <p>
            Once the offer is created the corresponding SOLX is moved to the exchange contract and a{" "}
            {saleFeePercent?.toString()}% is applied.
          </p>
          <p>People interested to buy SOLX can check the offers on the Exchange page and select one.</p>
          <p>Once your offer is purchased you will received BUSD to the same wallet.</p>
        </div>
      }
      title={"How to sell SOLX"}
      trigger={"click"}
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      overlayStyle={{ maxWidth: 300 }}
    >
      <QuestionCircleOutlined style={{ marginLeft: 2, display: "inline-block" }} />
    </Popover>
  );
};

const ApproveButton = ({ disabled, solxQuantityBN, writeContracts, tx }) => {
  const [txInProgress, setTxInProgress] = useState(false);
  const [approved, setApproved] = useState(false);
  const approvedDebounced = useDebounce(approved, 300);

  useEffect(() => {
    if (approvedDebounced) {
      setApproved(false);
      // Display notification for successful approval
      notification.success({
        message: "Approve success",
        description: `You can click Add offer now`,
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

    tx(writeContracts.SoleraX.approve(writeContracts.Exchange.address, ethers.constants.MaxUint256), update => {
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

const CreateListingButton = ({ solxQuantityBN, totalPriceBN, setListingCreated, disabled, writeContracts, tx }) => {
  const [txInProgress, setTxInProgress] = useState(false);

  const onClick = () => {
    setTxInProgress(true);

    if (!writeContracts.Exchange) {
      console.warn(`writeContracts.Exchange not defined`);
      setTxInProgress(false);

      notification.warn({
        message: "Wrong network?",
        description: `Exchange contract not found - are you connected to the Binance Smart Chain?`,
        placement: "bottomRight",
      });

      return;
    }

    tx(writeContracts.Exchange.createListing(solxQuantityBN, totalPriceBN), update => {
      console.log("📡 Buy Transaction Update:", update);
      setTxInProgress(false);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setListingCreated(true);
        logTransactionUpdate(update, "buy()");

        notification.success({
          message: "Offer created",
          description: `You created a sell offer for ${withDecimals(solxQuantityBN, 2)} SOLX`,
          placement: "bottomRight",
        });
      }
    });
  };

  return (
    <div>
      <Button
        loading={txInProgress}
        type={"primary"}
        shape="round"
        onClick={onClick}
        disabled={disabled}
        style={{ minWidth: 130 }}
      >
        Add offer
      </Button>
    </div>
  );
};

const calcMinPricePerPackage = (minPrice, solxQuantity, saleFeePercent, saleFeeFixed) => {
  const n = stringToBigNumber(solxQuantity);
  if (minPrice && n) {
    return minPrice.mul(n).div(ONE_ETHER);
  }

  return null;
};

const SolxSplit = ({ feeBN, totalSolxBN }) => {
  return (
    <div css={{ background: "#555", margin: "-5px 10px 5px 10px", padding: "6px 5px 2px 5px", borderRadius: 4 }}>
      Fee: {withDecimals(feeBN)} SOLX, Total: {withDecimals(totalSolxBN)} SOLX
    </div>
  );
};

export const CreateListingModal = ({ onClose, readContracts, writeContracts, tx, sellerAddress }) => {
  const minPrice = useContractReader(readContracts, "Exchange", "minSolxPrice");
  const minQuantity = useContractReader(readContracts, "Exchange", "minSolxQuantity");
  const saleFeePercent = useContractReader(readContracts, "Exchange", "saleFeePercent");
  const saleFeeFixed = useContractReader(readContracts, "Exchange", "saleFeeFixed");

  const solxBalance = useContractReader(readContracts, "SoleraX", "balanceOf", [sellerAddress]);
  const solxAllowance = useContractReader(readContracts, "SoleraX", "allowance", [
    sellerAddress,
    readContracts.Exchange?.address,
  ]);
  console.log(`SOLX allowance`, solxAllowance ? withDecimals(solxAllowance) : null);

  const canDisplayForm = minPrice && minQuantity && solxBalance && solxAllowance && saleFeePercent && saleFeeFixed;

  // Form state
  const [solxQuantity, setSolxQuantity] = useState("");
  const [solxQuantityError, setSolxQuantityError] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [totalPriceError, setTotalPriceError] = useState("");
  const [listingCreated, setListingCreated] = useState(false);
  const validForm = solxQuantity && totalPrice && solxQuantityError === "" && totalPriceError === "";

  const minPricePerPackage = calcMinPricePerPackage(minPrice, solxQuantity);

  // Buttons state
  const solxQuantityBN = solxQuantity && bigNumberFromFloat(parseFloat(solxQuantity));
  const feeBN = solxQuantityBN && calculateFee(solxQuantityBN, saleFeePercent, saleFeeFixed);
  const totalSolxBN = solxQuantityBN && feeBN && solxQuantityBN.add(feeBN);
  const totalPriceBN = totalPrice && bigNumberFromFloat(parseFloat(totalPrice));
  const approveEnabled = validForm && solxAllowance && totalSolxBN && solxAllowance.lt(totalSolxBN);
  const buyEnabled = validForm && !approveEnabled;

  const updateSolxQuantity = ev => {
    const val = ev.target.value.replace(",", ".").replace(/[^0-9.]/, "");
    setSolxQuantity(val);

    const valBN = stringToBigNumber(val);
    const fee = calculateFee(valBN, saleFeePercent, saleFeeFixed);
    let err = "";
    if (valBN && fee && solxBalance && solxBalance.lt(valBN.add(fee))) {
      err = "You don't have enough SOLX in your wallet";
    } else if (valBN && minQuantity && valBN.lt(minQuantity)) {
      err = "Can't sell less than minimum per package";
    } else if (!valBN) {
      err = "Required";
    }

    setSolxQuantityError(err);
  };

  const updateTotalPrice = ev => {
    const val = ev.target.value.replace(",", ".").replace(/[^0-9.]/, "");
    setTotalPrice(val);

    const valBN = stringToBigNumber(val);
    const _minPricePerPackage = calcMinPricePerPackage(minPrice, solxQuantity);
    if (valBN && _minPricePerPackage && valBN.lt(_minPricePerPackage)) {
      setTotalPriceError("Can't sell for less than minimum price");
    } else if (!valBN) {
      setTotalPriceError("Required");
    } else {
      setTotalPriceError("");
    }
  };

  return (
    <Modal
      visible
      title={"Sell SOLX"}
      onCancel={onClose}
      footer={<Note>Exchange is currently in beta mode. Please be mindful of the smart-contract risks.</Note>}
    >
      {listingCreated && (
        <>
          <h2>Offer created successfully</h2>
          <p>It will appear shortly on the Exchange page</p>
        </>
      )}
      {canDisplayForm && !listingCreated ? (
        <>
          <h2>
            How does this work? <HowSellingWorks {...{ saleFeePercent }} />
          </h2>
          <div css={{ marginTop: 20 }}>
            <label>How much SOLX do you want to sell?</label>
            <Note>Your balance: {withDecimals(solxBalance)} SOLX</Note>
            <div css={{ position: "relative" }}>
              <Input value={solxQuantity} onChange={updateSolxQuantity} />
              <InputToken>
                <img src={SolxLogo} alt={"SOLX logo"} width={16} css={{ display: "block" }} />
                <div css={{ fontSize: 16, marginLeft: 4 }}>SOLX</div>
              </InputToken>
            </div>
            {solxQuantityError && <InputError>{solxQuantityError}</InputError>}
            {solxQuantityBN && !solxQuantityError && feeBN && totalSolxBN && <SolxSplit {...{ feeBN, totalSolxBN }} />}
            <Note>Minimum per package: {withDecimals(minQuantity, 4)} SOLX</Note>
            <Note>
              Sale fee: {saleFeePercent?.toString()}% or {withDecimals(saleFeeFixed, 2)} SOLX (whichever is higher)
            </Note>
          </div>

          <div css={{ marginTop: 30 }}>
            <label>What's the total price?</label>
            <div css={{ position: "relative" }}>
              <Input value={totalPrice} onChange={updateTotalPrice} />
              <InputToken>
                <img src={BusdLogo} alt={"BUSD logo"} width={16} css={{ display: "block" }} />
                <div css={{ fontSize: 16, marginLeft: 4 }}>BUSD</div>
              </InputToken>
            </div>
            {totalPriceError && <InputError>{totalPriceError}</InputError>}
            {solxQuantity && minPricePerPackage && (
              <Note css={{ fontWeight: "bold" }}>
                Minimum price for your package: ${withDecimals(minPricePerPackage)}
              </Note>
            )}
            <Note>Minimum price per SOLX: ${withDecimals(minPrice)}</Note>
          </div>

          <div css={{ margin: "40px auto 0 auto", display: "flex", alignItems: "flex-start" }}>
            <ApproveButton disabled={!approveEnabled} {...{ writeContracts, tx, solxQuantityBN }} />
            <div css={{ flex: "1 1 auto" }}>&nbsp;</div>
            <CreateListingButton
              disabled={!buyEnabled}
              {...{ solxQuantityBN, totalPriceBN, writeContracts, tx, setListingCreated }}
            />
          </div>
        </>
      ) : null}

      {!canDisplayForm && !listingCreated && (
        <div css={{ display: "flex", alignItems: "center", marginTop: 40 }}>
          <Spin />
          <Note css={{ marginLeft: 20, marginBottom: 7 }}>Loading data from blockchain</Note>
        </div>
      )}
    </Modal>
  );
};
