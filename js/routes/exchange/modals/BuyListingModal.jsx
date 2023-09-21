/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { Button, Modal, notification, Popover, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { withDecimals } from "../../../utils/big-number";
import { useContractReader } from "eth-hooks";
import { Listing } from "../Listing";
import { useDebounce } from "../../../hooks";
import { logTransactionUpdate } from "../../../utils/evm-utils";
import { calculateFee } from "../exchange-utils";
import { ethers } from "ethers";

const { Text } = Typography;

const calcPurchasePrice = (totalPriceBN, feePercentBN, feeFixedBN) => {
  if (totalPriceBN && feePercentBN && feeFixedBN) {
    const fee = calculateFee(totalPriceBN, feePercentBN, feeFixedBN);
    return totalPriceBN.add(fee);
  }

  return null;
};

const BuyFeePopover = ({ buyFeePercent, buyFeeFixed }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={
        <div>
          Purchases are subject to a {buyFeePercent?.toString()}% or {withDecimals(buyFeeFixed, 2)} BUSD (whichever is
          higher) exchange commission that gets added to the offer price
        </div>
      }
      title={"Purchase fee"}
      trigger={"click"}
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      overlayStyle={{ maxWidth: 300 }}
    >
      <QuestionCircleOutlined style={{ marginLeft: 2, display: "inline-block" }} />
    </Popover>
  );
};

const ApproveButton = ({ hasEnoughAllowance, hasEnoughBUSD, writeContracts, tx, purchasePrice }) => {
  const [txInProgress, setTxInProgress] = useState(false);
  const [approved, setApproved] = useState(false);
  const approvedDebounced = useDebounce(approved, 300);

  const disabled = hasEnoughAllowance === true || !hasEnoughBUSD;

  useEffect(() => {
    if (approvedDebounced) {
      setApproved(false);
      // Display notification for successful approval
      notification.success({
        message: "Approve success",
        description: `You can click Buy now`,
        placement: "bottomRight",
      });
    }
  }, [approvedDebounced]);

  const onClick = () => {
    setTxInProgress(true);

    if (!writeContracts.BUSD) {
      console.warn(`writeContracts.BUSD not defined`);
      setTxInProgress(false);

      notification.warn({
        message: "Wrong network?",
        description: `BUSD contract not found - are you connected to the Binance Smart Chain?`,
        placement: "bottomRight",
      });

      return;
    }

    // const approveAmount = ethers.constants.MaxUint256;
    tx(writeContracts.BUSD.approve(writeContracts.Exchange.address, ethers.constants.MaxUint256), update => {
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
      Approve BUSD
    </Button>
  );
};

const BuyButton = ({ hasEnoughAllowance, hasEnoughBUSD, writeContracts, tx, listing }) => {
  const [txInProgress, setTxInProgress] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const disabled = hasEnoughAllowance === false || hasEnoughBUSD === false || purchased;

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

    tx(writeContracts.Exchange.buy(listing.key), update => {
      console.log("📡 Buy Transaction Update:", update);
      setTxInProgress(false);
      // "Error: VM Exception while processing transaction: reverted with reason string 'Current price is above maxPrice'"
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setPurchased(true);
        logTransactionUpdate(update, "buy()");

        notification.success({
          message: "Successful purchase",
          description: `You purchased ${withDecimals(listing.solxQuantity, 2)} SOLX`,
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
        Buy SOLX
      </Button>
      {purchased && <div css={{ color: "green" }}>Successful purchase</div>}
    </div>
  );
};

const Note = styled.div({
  fontStyle: "italic",
  color: "#acacac",
  fontSize: 13,
  textAlign: "left",
});

export const BuyListingModal = ({ listing, onClose, readContracts, writeContracts, tx, buyerAddress }) => {
  const buyFeePercent = useContractReader(readContracts, "Exchange", "buyFeePercent");
  const buyFeeFixed = useContractReader(readContracts, "Exchange", "buyFeeFixed");
  const displayAddress = listing ? listing.seller?.substr(0, 5) + "..." + listing.seller?.substr(-4) : null;
  const createdAt = listing?.createdAt
    ? new Date(parseInt(listing.createdAt.toString()) * 1000).toLocaleString()
    : null;
  const balanceBusd = useContractReader(readContracts, "BUSD", "balanceOf", [buyerAddress]);
  const allowanceBusd = useContractReader(readContracts, "BUSD", "allowance", [
    buyerAddress,
    readContracts.Exchange?.address,
  ]);
  const purchasePrice = calcPurchasePrice(listing.totalPrice, buyFeePercent, buyFeeFixed);
  const hasEnoughAllowance = allowanceBusd && purchasePrice ? allowanceBusd.gte(purchasePrice) : null;
  const hasEnoughBUSD = balanceBusd && purchasePrice ? balanceBusd.gte(purchasePrice) : null;
  const displayLoading = hasEnoughAllowance === null || hasEnoughBUSD === null;
  const buyerAndSellerIsTheSame = listing.seller === buyerAddress;
  const displayButtons = !displayLoading && !buyerAndSellerIsTheSame;
  const listingUrl = typeof window !== "undefined" && `${window.location.origin}/exchange/${listing.key}`;

  return (
    <Modal
      title={"Buy SOLX"}
      visible
      onCancel={onClose}
      footer={<Note>Exchange is currently in beta mode. Please be mindful of the smart-contract risks.</Note>}
    >
      <Note css={{ marginTop: -10, marginBottom: 5 }}>Seller: {displayAddress}</Note>
      <Note css={{ marginTop: -10, marginBottom: 5 }}>Date: {createdAt}</Note>
      {balanceBusd && (
        <Note css={{ marginTop: 0 }}>
          <div>
            Your balance:{" "}
            <span css={{ padding: "2px 5px", border: "solid 0px #ccc", background: "#444", borderRadius: 3 }}>
              {withDecimals(balanceBusd, 2)} BUSD
            </span>
          </div>
          {hasEnoughBUSD === false && (
            <div css={{ color: "red" }}>You don't seem to have enough funds to purchase this package</div>
          )}
        </Note>
      )}

      <Listing
        styles={{ margin: "30px auto" }}
        listing={listing}
        shadow={false}
        busdPriceBN={purchasePrice}
        note={
          <>
            <span>${withDecimals(listing.totalPrice, 2)}</span> + fee{" "}
            <BuyFeePopover {...{ buyFeePercent, buyFeeFixed }} />
          </>
        }
      />

      {buyerAndSellerIsTheSame && (
        <div>
          <h2 css={{ color: "green" }}>This is your own offer</h2>
          <div>
            <b>Copy the link below and send it to potential buyers:</b>
          </div>
          <Text copyable={{ text: listingUrl }}>{listingUrl}</Text>
        </div>
      )}

      {displayLoading && (
        <div css={{ fontStyle: "italic", color: "#ccc", fontSize: 13 }}>Loading data from blockchain ...</div>
      )}

      {displayButtons && (
        <div css={{ margin: "20px auto 0 auto", display: "flex", alignItems: "flex-start" }}>
          <ApproveButton {...{ hasEnoughAllowance, hasEnoughBUSD, writeContracts, tx, purchasePrice }} />
          <div css={{ flex: "1 1 auto" }}>&nbsp;</div>
          <BuyButton {...{ hasEnoughAllowance, hasEnoughBUSD, writeContracts, tx, listing }} />
        </div>
      )}
    </Modal>
  );
};
