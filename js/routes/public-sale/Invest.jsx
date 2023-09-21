/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { Button, Radio, Popover, Spin, notification, Modal } from "antd";
import { ArrowDownOutlined, QuestionCircleOutlined, SwapOutlined, EditFilled } from "@ant-design/icons";
import styled from "@emotion/styled";
import Busd from "./busd.png";
import Usdt from "./usdt.png";
import BnbLogo from "./bnb.png";
import SolxLogo from "../../assets/solx-logo.png";
import { useContractReader } from "eth-hooks";
import { bigNumberFromFloat, round, withDecimals } from "../../utils/big-number";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { logTransactionUpdate } from "../../utils/evm-utils";
import { InvestSuccessModal } from "./InvestSuccessModal";
import { ethers } from "ethers";
import { useDebounce } from "../../hooks";

const ApproveButton = ({ onClick, disabled = false }) => {
  return (
    <Button type={"primary"} shape="round" size="large" onClick={onClick} disabled={disabled} style={{ width: 130 }}>
      Approve
    </Button>
  );
};

const InvestButton = ({ onClick, disabled = false }) => {
  return (
    <Button type={"primary"} shape="round" size="large" onClick={onClick} disabled={disabled} style={{ width: 130 }}>
      Invest
    </Button>
  );
};

const SolxWrapper = styled.div({
  position: "absolute",
  left: 5,
  right: 7,
  top: -26,
  display: "flex",
  alignItems: "center",
});

const Box = styled.div({
  border: `1px solid #686df1!important`,
  margin: `20px auto 0 auto`,
  padding: 10,
  paddingBottom: 20,
  maxWidth: 400,
  borderRadius: 4,
  background: `linear-gradient(180deg,rgba(13,153,255,.15),rgba(13,153,255,.1))`,
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
  textAlign: "center",
  // boxShadow: disabled ? "none" : `rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px`,
  boxShadow: `rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px`,
}));

const Stables = styled.div({
  marginBottom: 10,
  "&.ant-radio": {
    fontSize: 16,
  },
});

const StableIcon = styled.img({
  width: 20,
});

const Line = styled.div({
  display: "flex",
  alignItems: "center",
});

const Left = styled.div({
  flex: "1 1 auto",
  textAlign: "left",
  paddingLeft: 4,
  display: "flex",
  alignItems: "center",
});

const Right = styled.div({
  textAlign: "right",
  paddingRight: 4,
  display: "flex",
  alignItems: "center",
});

const StableBalance = styled.div({
  position: "absolute",
  top: 36,
  left: 8,
  right: 8,
  paddingTop: 5,
  background: `rgba(255, 255, 255, 0.2)`,
  borderRadius: 4,
});

// Display SOLX to USD and a button to revert the direction (USD to SOLX)
const ExchangeRate = ({ price }) => {
  const [solxToUsd, setSolxToUsd] = useState(true);

  if (!price) {
    return null;
  }

  const oneSolx = withDecimals(price);
  const oneUsd = round(1 / parseFloat(formatEther(price)), 4);

  return (
    <>
      {solxToUsd ? <>1 SOLX = ${oneSolx}</> : <>$1 = {oneUsd} SOLX</>}
      <a onClick={() => setSolxToUsd(!solxToUsd)} css={{ marginLeft: 5, color: "white" }}>
        <SwapOutlined />
      </a>
    </>
  );
};

const MaximumPricePopover = () => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={
        <div>
          This is the maximum price you'll pay per SOLX taking the above slippage into consideration. If the SOLX price
          moves above this price by the time your transaction gets processed on the blockchain, your transaction will
          revert.
        </div>
      }
      title={"Maximum accepted price"}
      trigger={"click"}
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      overlayStyle={{ maxWidth: 300 }}
    >
      <QuestionCircleOutlined style={{ marginLeft: 7 }} />
    </Popover>
  );
};

const SlippagePopover = () => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={
        <div>
          The SOLX price can change between the time you send the transaction and the time when the transaction is
          processed on the blockchain. Slippage allows you to set a maximum accepted price.
        </div>
      }
      title={"Slippage"}
      trigger={"click"}
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      overlayStyle={{ maxWidth: 300 }}
    >
      <QuestionCircleOutlined style={{ marginLeft: 7 }} />
    </Popover>
  );
};

const SlippageInputPopover = ({ slippage, updateSlippage }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={
        <div>
          <input value={slippage} onChange={ev => updateSlippage(ev.target.value)} css={{ color: "#333333" }} />
        </div>
      }
      title={"Slippage"}
      trigger={"click"}
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      overlayStyle={{ maxWidth: 300 }}
    >
      <EditFilled style={{ marginLeft: 7 }} />
    </Popover>
  );
};

const MinimumReceivedPopover = () => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={
        <div>Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.</div>
      }
      title={"Minimum SOLX received"}
      trigger={"click"}
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      overlayStyle={{ maxWidth: 300 }}
    >
      <QuestionCircleOutlined style={{ marginLeft: 7 }} />
    </Popover>
  );
};

const TxSpinner = ({ visible = true }) => {
  if (!visible) {
    return null;
  }

  return (
    <div css={{ marginTop: 15 }}>
      <Spin />
    </div>
  );
};

export const Invest = ({ readContracts, writeContracts, address, tx, balanceBNB }) => {
  const [stable, setStable] = useState("busd");
  const [stableAmount, setStableAmount] = useState("");
  const [solxAmount, setSolxAmount] = useState("");
  const [slippage, setSlippage] = useState("5");
  const [txInProgress, setTxInProgress] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [approved, setApproved] = useState(false);
  const approvedDebounced = useDebounce(approved, 300);
  const [error, setError] = useState(null);

  const publicSaleAddress = readContracts.PublicSaleV2?.address;
  const solxBalance = useContractReader(readContracts, "SoleraX", "balanceOf", [address]);
  const price = useContractReader(readContracts, "PublicSaleV2", "price");
  const minInvest = useContractReader(readContracts, "PublicSaleV2", "minInvest");
  const balanceBusd = useContractReader(readContracts, "BUSD", "balanceOf", [address]);
  const balanceUsdt = useContractReader(readContracts, "USDT", "balanceOf", [address]);
  const balance = stable === "busd" ? balanceBusd : stable === "usdt" ? balanceUsdt : balanceBNB;

  const allowanceBusd = useContractReader(readContracts, "BUSD", "allowance", [address, publicSaleAddress]);
  const allowanceUsdt = useContractReader(readContracts, "USDT", "allowance", [address, publicSaleAddress]);
  const allowance = stable === "busd" ? allowanceBusd : stable === "usdt" ? allowanceUsdt : ethers.constants.MaxUint256;

  const [usdAmount, setUsdAmount] = useState(null);

  useEffect(() => {
    if (approvedDebounced) {
      setApproved(false);
      // Display notification for successful transaction
      notification.success({
        message: "Approve success",
        description: `You can click Invest now`,
        placement: "bottomRight",
      });
    }
  }, [approvedDebounced]);

  // console.log({
  //   busd: balanceBusd ? formatEther(balanceBusd) : null,
  //   usdt: balanceUsdt ? formatEther(balanceUsdt) : null,
  //   allowance: allowance ? formatEther(allowance) : null,
  // });

  const needApproval = allowance && stableAmount && allowance.lt(bigNumberFromFloat(parseFloat(stableAmount)));
  const canInvest =
    allowance && stableAmount && parseFloat(stableAmount) > 0 && allowance.gte(bigNumberFromFloat(stableAmount));

  // Maximum price taking slippage into account
  const maxPriceFloat = price ? (parseFloat(formatEther(price)) * (100 + Number(slippage))) / 100 : null;

  // Minimum SOLX received based on stablecoin amount and maximumPrice
  const minimumReceived =
    stable.toUpperCase() === "BNB"
      ? usdAmount && maxPriceFloat
        ? round(parseFloat(formatEther(usdAmount)) / maxPriceFloat)
        : ""
      : stableAmount && maxPriceFloat
      ? round(parseFloat(stableAmount) / maxPriceFloat)
      : "";

  const updateStableAmount = val => {
    val = val.replace(",", ".").replace(/[^0-9.]/, "");
    setStableAmount(val);
  };

  useEffect(async () => {
    // Exchange BNB to USD
    let _usdAmount;
    if (stable === "bnb" && stableAmount) {
      let bnbToUsd;
      try {
        bnbToUsd = await readContracts.PublicSaleV2?.bnbToUsd(bigNumberFromFloat(stableAmount));
      } catch (e) {}
      if (bnbToUsd) {
        _usdAmount = bnbToUsd.usdAmount;
        setUsdAmount(_usdAmount);
      }
    }

    // Calculate SOLX to be purchased
    const valN = parseFloat(stableAmount);
    const validStableAmount = !isNaN(valN);
    if (validStableAmount && price) {
      const total = stable === "bnb" ? parseFloat(formatEther(_usdAmount || 0)) : stableAmount;
      setSolxAmount(round(total / parseFloat(formatEther(price))).toString());
    } else {
      setSolxAmount("");
    }

    // Check user has enough funds to invest
    setError(null);
    if (validStableAmount && balance && parseUnits(stableAmount).gt(balance)) {
      setError("You don't seem to have enough funds");
      return;
    }

    // Check investment is above minimum
    if (validStableAmount && minInvest) {
      const bnbBelowMin = stable.toUpperCase() === "BNB" && _usdAmount && _usdAmount.lt(minInvest);
      const stableBelowMin = stable.toUpperCase() !== "BNB" && parseUnits(stableAmount).lt(minInvest);
      if (bnbBelowMin || stableBelowMin) {
        setError(`Minimum investment is ${formatEther(minInvest)}`);
      }
    }
  }, [stableAmount, stable]);

  const updateSlippage = val => {
    setSlippage(val.replace(/[^0-9]/, ""));
  };

  const onApproveClick = () => {
    setTxInProgress(true);

    const contractName = stable.toUpperCase();
    if (!writeContracts[contractName]) {
      console.warn(`writeContracts[${contractName}] not defined`);
      setTxInProgress(false);
      return;
    }

    // const approveAmount = bigNumberFromFloat(stableAmount);
    tx(writeContracts[contractName].approve(publicSaleAddress, ethers.constants.MaxUint256), update => {
      console.log("📡 Transaction Update:", update);
      setTxInProgress(false);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setApproved(true);
        logTransactionUpdate(update, "approve()");
      }
    });
  };

  const onSuccessModalClose = () => {
    setSuccessModalVisible(false);

    // Cleanup
    setStableAmount("");
    setSolxAmount("");
  };

  const onInvestClick = () => {
    // setSuccessModalVisible(true);
    // return;
    setTxInProgress(true);

    if (!writeContracts.PublicSaleV2) {
      console.warn(`writeContracts.PublicSaleV2 not defined - do you have enough BNB for gas?`);
      setTxInProgress(false);
      return;
    }

    if (stable.toUpperCase() === "BNB") {
      tx(
        writeContracts.PublicSaleV2.investBNB(bigNumberFromFloat(maxPriceFloat), {
          value: bigNumberFromFloat(stableAmount),
        }),
        update => {
          console.log("📡 Transaction Update:", update);
          setTxInProgress(false);
          // "Error: VM Exception while processing transaction: reverted with reason string 'Current price is above maxPrice'"
          if (update && (update.status === "confirmed" || update.status === 1)) {
            setSuccessModalVisible(true);
            logTransactionUpdate(update, "investBNB()");
          }
        },
      );
    } else {
      const stableAddress = writeContracts[stable.toUpperCase()].address;
      tx(
        writeContracts.PublicSaleV2.investMaxPrice(
          stableAddress,
          bigNumberFromFloat(stableAmount),
          bigNumberFromFloat(maxPriceFloat),
        ),
        update => {
          console.log("📡 Transaction Update:", update);
          setTxInProgress(false);
          // "Error: VM Exception while processing transaction: reverted with reason string 'Current price is above maxPrice'"
          if (update && (update.status === "confirmed" || update.status === 1)) {
            setSuccessModalVisible(true);
            logTransactionUpdate(update, "investMaxPrice()");
          }
        },
      );
    }
  };

  return (
    <div>
      <Box>
        <h2 css={{ marginBottom: 0 }}>How much would you like to invest?</h2>
        {minInvest && (
          <div css={{ color: "#999", marginBottom: 15 }}>Minimum investment: {formatEther(minInvest)} USD</div>
        )}
        <div css={{ margin: "0 auto", maxWidth: 320 }}>
          <Stables>
            <Radio.Group onChange={ev => setStable(ev.target.value)} value={stable}>
              <Radio value={"busd"}>
                <StableIcon src={Busd} /> BUSD
              </Radio>
              <Radio value={"usdt"}>
                <StableIcon src={Usdt} /> USDT
              </Radio>
              <Radio value={"bnb"}>
                <StableIcon src={BnbLogo} /> BNB
              </Radio>
            </Radio.Group>
          </Stables>

          <div css={{ position: "relative" }}>
            <StableBalance>
              <Line>
                <Left>Your balance</Left>
                <Right>
                  {balance && (
                    <div>
                      {withDecimals(balance)} {stable?.toUpperCase()}{" "}
                    </div>
                  )}
                </Right>
              </Line>
              {stable.toUpperCase() === "BNB" && usdAmount && (
                <Line>
                  <Left></Left>
                  <Right>
                    <span css={{ color: "#aaa" }}>
                      {stableAmount} BNB = {withDecimals(usdAmount, 4)} USD
                    </span>
                  </Right>
                </Line>
              )}
            </StableBalance>
            <Input onChange={ev => updateStableAmount(ev.target.value)} value={stableAmount} />
          </div>

          <div css={{ margin: "55px auto 25px 0" }}>
            <ArrowDownOutlined style={{ fontSize: 20 }} />
          </div>

          <div css={{ position: "relative" }}>
            <SolxWrapper>
              <img src={SolxLogo} alt={"SOLX logo"} width={16} css={{ display: "block" }} />
              <div css={{ fontSize: 14, marginLeft: 4 }}>SOLX</div>
              <div css={{ flex: "1 1 auto", textAlign: "right" }}>{solxBalance && withDecimals(solxBalance)}</div>
            </SolxWrapper>
            <Input disabled value={solxAmount} />
          </div>

          <div css={{ marginTop: 20 }}>
            <Line>
              <Left>Price</Left>
              <Right>
                <ExchangeRate price={price} />
              </Right>
            </Line>
            <Line>
              <Left>
                Slippage <SlippagePopover />
              </Left>
              <Right>
                <div>{slippage}%</div>
                <SlippageInputPopover {...{ slippage, updateSlippage }} />
              </Right>
            </Line>
            <Line>
              <Left>
                Maximum price <MaximumPricePopover />
              </Left>
              <Right>{maxPriceFloat && "$" + withDecimals(bigNumberFromFloat(maxPriceFloat))}</Right>
            </Line>
            {minimumReceived > 0 && (
              <Line>
                <Left>
                  <div>Minimum received</div>
                  <MinimumReceivedPopover />
                </Left>
                {minimumReceived && <Right>{minimumReceived} SOLX</Right>}
              </Line>
            )}
          </div>

          {error && <div css={{ color: "red", marginTop: 10 }}>{error}</div>}

          <div css={{ margin: "30px auto 0 auto", display: "flex", alignItems: "center" }}>
            <ApproveButton disabled={!needApproval || txInProgress || error} onClick={onApproveClick} />
            <div css={{ flex: "1 1 auto" }}>&nbsp;</div>
            <InvestButton disabled={!canInvest || txInProgress || error} onClick={onInvestClick} />
          </div>
          <TxSpinner visible={txInProgress} />
        </div>
      </Box>
      <InvestSuccessModal
        visible={successModalVisible}
        onClose={onSuccessModalClose}
        solxAddress={readContracts.SoleraX?.address}
      />
    </div>
  );
};
