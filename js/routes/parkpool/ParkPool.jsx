/** @jsxImportSource @emotion/react */
import React from "react";
import ParkPoolExplainer from "./ParkPoolExplainer";
import ParkPoolProgressBar from "./ParkPoolProgressBar";
import ParkPoolTotalSOLX from "./ParkPoolTotalSOLX";
import ParkPoolUserDeposit from "./ParkPoolUserDeposit";
import { ParkPoolNotLoggedInInfo } from "./ParkPoolNotLoggedInInfo";
import ParkPoolClaim from "./ParkPoolClaim";

const ParkPool = ({ readContracts, address, tx, writeContracts, loadWeb3Modal }) => {
  return (
    <>
      <ParkPoolExplainer />
      {address ? (
        <div css={{ display: "grid", gridGap: 40 }}>
          <ParkPoolProgressBar readContracts={readContracts} />
          <ParkPoolTotalSOLX readContracts={readContracts} />
          <ParkPoolUserDeposit {...{ readContracts, address, tx, writeContracts }} />
          <ParkPoolClaim {...{ readContracts, address, tx, writeContracts }} />
        </div>
      ) : (
        <ParkPoolNotLoggedInInfo loadWeb3Modal={loadWeb3Modal} />
      )}
    </>
  );
};

export default ParkPool;
