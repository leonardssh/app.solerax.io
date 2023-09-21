/** @jsxImportSource @emotion/react */
import { useContractReader } from "eth-hooks";
import React from "react";
import styled from "@emotion/styled";
import { round2, withDecimals } from "../../utils/big-number";
import ParkPhoto from "./parc_fotovoltaic.jpg";

const KWH_TO_USD = 2000;
const SOLX_TO_USD = 2.5;
const KWH_TO_SOLX = KWH_TO_USD / SOLX_TO_USD;

const solxToKWh = solx => solx / KWH_TO_SOLX;

const TotalSOXL = styled.div`
  font-size: 30px;
  display: flex;
  align-items: center;
`;

const Wrapper = styled.div`
  //display: grid;
  //grid-template-columns: 1fr 1fr;
  display: flex;
  position: relative;
  align-items: center;
  max-width: 400px;
  margin: 0 auto;
  justify-content: center;
  //background-color: rgb(37, 204, 156);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const Photo = styled.img`
  display: block;
  background-color: white;
  color: #000;
  text-align: center;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  padding: 1px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  //position: absolute;
  //top: 0;
  //right: -75px;
`;

const ParkPoolTotalSOLX = ({ totalDeposited }) => {
  return (
    <div>
      <h2>Total SOLX deposited</h2>
      <div>
        <Photo src={ParkPhoto} alt="Photovoltaic Park" />
      </div>
      <Wrapper>
        <TotalSOXL>
          <div>
            <b>{totalDeposited}</b> SOLX
          </div>
          <div css={{ minWidth: 40 }}>=</div>
          <div>{round2(solxToKWh(totalDeposited))} kWh</div>
        </TotalSOXL>
      </Wrapper>
    </div>
  );
};

const ParkPoolTotalSC = ({ readContracts }) => {
  const totalDepositedBN = useContractReader(readContracts, "ParkPool", "totalDeposited");
  // console.log({ totalDepositedBN: totalDepositedBN?.toString() });

  if (!totalDepositedBN) {
    return null;
  }

  return <ParkPoolTotalSOLX totalDeposited={withDecimals(totalDepositedBN, 2)} />;
  // return <ParkPoolTotalSOLX totalDeposited={2500.86} />;
};

export default ParkPoolTotalSC;
