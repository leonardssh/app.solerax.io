/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { useContractReader } from "eth-hooks";
import { BigNumber, ethers } from "ethers";
import { Button, Spin, notification } from "antd";
import { evmErrorMessage, logTransactionUpdate } from "../../utils/evm-utils";
import { GenericVestingInfo } from "./GenericVestingInfo";
import { PageWrap } from "../../components/PageWrap";
import { VestingChart } from "./VestingChart";
import { BeneficiaryNotFound } from "./BeneficiaryNotFound";
import { useDebounce } from "../../hooks";

const { formatEther } = ethers.utils;

const TokenValue = ({ label, val, tokenSymbol = "SOLX" }) => {
  return (
    <div css={{ display: "flex", alignItems: "center", marginBottom: 10, marginLeft: "auto", marginRight: "auto" }}>
      <div style={{ width: 150, textAlign: "left", marginRight: 10 }}>{label}</div>
      <div style={{ borderBottom: `solid 1px #efefef`, width: 150, textAlign: "right" }}>
        {formatEther(val)} {tokenSymbol}
      </div>
    </div>
  );
};

const Vesting = ({ readContracts, address, tx, writeContracts, loadWeb3Modal }) => {
  const [vestingInfo, setVestingInfo] = useState();
  const [beneficiaryExists, setBeneficiaryExists] = useState(null);
  const [solxBalance, setSolxBalance] = useState();
  const [claiming, setClaiming] = useState(false);

  const [claimed, setClaimed] = useState(null);
  const claimedDebounced = useDebounce(claimed, 300);

  useEffect(() => {
    if (claimedDebounced) {
      // Display notification for successful transaction
      notification.success({
        message: "Success",
        description: `Claimed ${formatEther(claimedDebounced)} SOLX`,
        placement: "bottomRight",
      });
      setClaimed(null);
    }
  }, [claimedDebounced]);

  async function getVestingInfo() {
    try {
      console.log(`Get vesting info for ${address}`);
      setVestingInfo(await readContracts.Vesting?.getVestingInfo(address));
      setBeneficiaryExists(true);
    } catch (e) {
      console.warn(e);
      setVestingInfo(null);
      if (
        evmErrorMessage(e)?.indexOf("Beneficiary not found") >= -1 ||
        e.reason?.indexOf("Beneficiary not found") >= -1
      ) {
        setBeneficiaryExists(false);
      }
    }
  }

  async function solx() {
    try {
      setSolxBalance(await readContracts.SoleraX.balanceOf(address));
    } catch (e) {
      console.warn(`SoleraX contract is not deployed`);
    }
  }

  useEffect(() => {
    if (readContracts.Vesting && readContracts.SoleraX && address) {
      getVestingInfo();
      solx();
    } else {
      console.log(`Address and/or contracts not instantiated`);
      setVestingInfo(null);
      setBeneficiaryExists(null);
    }
  }, [address, readContracts.Vesting]);

  const unlockTimestamps = useContractReader(readContracts, "Vesting", "getUnlockTimestamps");
  // console.log(unlockTimestamps && unlockTimestamps[0].mul(1000).toNumber());

  const onClaim = claimable => {
    setClaiming(true);
    if (writeContracts?.Vesting) {
      tx(writeContracts.Vesting.claim(), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          getVestingInfo();
          solx();
          setClaimed(claimable);

          logTransactionUpdate(update, "claim()");
        }
        setClaiming(false);
      });
    } else {
      setClaiming(false);
      console.log(`No vesting contract to claim() on`);
    }
  };

  if (!address) {
    return <GenericVestingInfo {...{ loadWeb3Modal }} />;
  } else if (address && beneficiaryExists === false) {
    return <BeneficiaryNotFound address={address} />;
  } else if (!vestingInfo) {
    return <Spin />;
  }

  return (
    <PageWrap>
      {vestingInfo && (
        <div>
          <div css={{ width: 320, margin: "0 auto" }}>
            {solxBalance && <TokenValue label={"Tokens in your wallet"} val={solxBalance} />}
            <TokenValue label={"Total purchased"} val={vestingInfo.total} />
            <TokenValue label={"Claimed"} val={vestingInfo.released} />
            <TokenValue label={"Available to claim now"} val={vestingInfo.claimable} />
          </div>

          {vestingInfo?.claimable.gt(BigNumber.from("0")) && (
            <div css={{ marginTop: "2em", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                type={"primary"}
                shape="round"
                size="large"
                onClick={() => onClaim(vestingInfo.claimable)}
                disabled={claiming}
              >
                Claim now
              </Button>
              {claiming && (
                <div css={{ marginLeft: 20, marginTop: 3 }}>
                  <Spin />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div css={{ marginTop: "2em" }}>
        {unlockTimestamps && vestingInfo && <VestingChart {...{ vestingInfo, unlockTimestamps }} />}
      </div>
    </PageWrap>
  );
};

export default Vesting;
