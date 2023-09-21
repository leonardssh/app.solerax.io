/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import styled from "@emotion/styled";
import { DatePicker, Tabs } from "antd";
import { PageWrap } from "../../components/PageWrap";
import { useContractReader } from "eth-hooks";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { withDecimals } from "../../utils/big-number";
import format from "date-fns/format";
import DepositParkReward from "./DepositParkReward";

const { TabPane } = Tabs;

const fmt = bn => (bn ? formatEther(bn) : null);

const AddressLink = ({ address, network }) => {
  if (!address) {
    return null;
  }

  return (
    <a href={`${network.blockExplorer}/address/${address}`} target={"_blank"}>
      {address}
    </a>
  );
};

const Info = styled.div({
  color: "#888",
  marginBottom: 10,
});

const WriteContract = ({ address = "0xaC3bc8B4187bfEA8A3Df3A2Ce54F62b397c56dBE" }) => (
  <a
    css={{ color: "#888", textDecoration: "underline" }}
    target={"_blank"}
    href={`https://bscscan.com/address/${address}#writeContract`}
  >
    Write contract
  </a>
);

const PublicSaleContract = ({ readContracts, network, contractName = "PublicSale" }) => {
  const saleOwner = useContractReader(readContracts, contractName, "owner");
  const saleSolxAddress = useContractReader(readContracts, contractName, "investToken");
  const saleSolxBalance = useContractReader(readContracts, contractName, "investTokenBalance");
  const saleTotalInvested = useContractReader(readContracts, contractName, "totalInvested");
  const saleInvestmentsCount = useContractReader(readContracts, contractName, "investmentsCount");
  const saleInvestorsCount = useContractReader(readContracts, contractName, "investorsCount");
  const saleStables = useContractReader(readContracts, contractName, "getStables");

  const feeThreshold = useContractReader(readContracts, contractName, "FEE_THRESHOLD");
  const feePercent = useContractReader(readContracts, contractName, "FEE_PERCENT");
  const feeDivisor = useContractReader(readContracts, contractName, "FEE_PERCENT_DIVISOR");
  const feeAsPercent = feePercent && feeDivisor ? (feePercent / feeDivisor) * 100 : null;
  const feeOwner = useContractReader(readContracts, contractName, "feeOwner");

  return (
    <>
      <h3>Contract</h3>
      <ul>
        <li>
          Contract address: <AddressLink address={readContracts[contractName]?.address} network={network} />
        </li>
        <li>
          Owner: <AddressLink address={saleOwner} network={network} />
        </li>
        <li>
          Stablecoins accepted:
          <br />{" "}
          {saleStables &&
            saleStables.map(addr => (
              <div key={addr}>
                <AddressLink address={addr} network={network} />
              </div>
            ))}
        </li>
      </ul>

      <h3>SOLX</h3>
      <ul>
        <li>
          SOLX address: <AddressLink address={saleSolxAddress} network={network} />
        </li>
        <li>
          <b>SOLX balance: {saleSolxBalance ? formatEther(saleSolxBalance) : null}</b>
        </li>
      </ul>

      <h3>Investments</h3>
      <ul>
        <li>Total invested: {saleTotalInvested ? formatEther(saleTotalInvested) : null} USD</li>
        <li>Investments count: {saleInvestmentsCount?.toString()}</li>
        <li>Investors count: {saleInvestorsCount?.toString()}</li>
      </ul>

      <h3>Fees</h3>
      <ul>
        <li>Threshold: {feeThreshold ? formatEther(feeThreshold) : null}</li>
        <li>Fee: {feeAsPercent}%</li>
        <li>
          Fee owner: <AddressLink address={feeOwner} network={network} />
        </li>
      </ul>
    </>
  );
};

const VestingContract = ({ readContracts, network }) => {
  const vestingOwner = useContractReader(readContracts, "Vesting", "owner");
  const vestingSolxBalance = useContractReader(readContracts, "Vesting", "balance");
  const vestingBeneficiaries = useContractReader(readContracts, "Vesting", "beneficiariesCount");
  const vestingTotal = useContractReader(readContracts, "Vesting", "totalAmount");
  const vestingClaimed = useContractReader(readContracts, "Vesting", "totalClaimed");

  return (
    <>
      <ul>
        <li>
          Contract address: <AddressLink address={readContracts.Vesting?.address} network={network} />
        </li>
        <li>
          Owner: <AddressLink address={vestingOwner} network={network} />
        </li>
        <li>SOLX balance: {vestingSolxBalance ? formatEther(vestingSolxBalance) : null}</li>
        <li>Beneficiaries: {vestingBeneficiaries?.toString() || null}</li>
        <li>Total SOLX for vesting: {vestingTotal ? formatEther(vestingTotal) : null}</li>
        <li>
          Total SOLX for vesting per month: {vestingTotal ? withDecimals(vestingTotal.div(BigNumber.from("12"))) : null}
        </li>
        <li>Total SOLX claimed: {vestingClaimed ? formatEther(vestingClaimed) : null}</li>
      </ul>
    </>
  );
};

const ExchangeContract = ({ readContracts, network }) => {
  const owner = useContractReader(readContracts, "Exchange", "owner");
  const feeOwner = useContractReader(readContracts, "Exchange", "feeOwner");

  const minSolxPrice = useContractReader(readContracts, "Exchange", "minSolxPrice");
  const minSolxQuantity = useContractReader(readContracts, "Exchange", "minSolxQuantity");

  const saleFee = useContractReader(readContracts, "Exchange", "saleFeePercent");
  const saleFeeFixed = useContractReader(readContracts, "Exchange", "saleFeeFixed");
  const buyFee = useContractReader(readContracts, "Exchange", "buyFeePercent");
  const buyFeeFixed = useContractReader(readContracts, "Exchange", "buyFeeFixed");

  const listingsCount = useContractReader(readContracts, "Exchange", "listingsCount");
  const completedSales = useContractReader(readContracts, "Exchange", "completedSales");
  const totalSalesSolx = useContractReader(readContracts, "Exchange", "totalSalesSolx");
  const totalSalesBusd = useContractReader(readContracts, "Exchange", "totalSalesBusd");
  const totalSolxFee = useContractReader(readContracts, "Exchange", "totalSolxFee");
  const totalBusdFee = useContractReader(readContracts, "Exchange", "totalBusdFee");

  return (
    <>
      <ul>
        <li>
          Contract address: <AddressLink address={readContracts.Exchange?.address} network={network} />
        </li>
        <li>
          Owner: <AddressLink address={owner} network={network} />
        </li>
        <li>
          Fee owner: <AddressLink address={feeOwner} network={network} />
        </li>
      </ul>

      <h3>Minimums</h3>
      <ul>
        <li>
          Min solx price: {fmt(minSolxPrice)} BUSD
          <br />
          <Info>
            <WriteContract /> > 9. setMinSolxPrice (18 decimals): {minSolxPrice?.toString()}
          </Info>
        </li>
        <li>
          Min solx quantity: {fmt(minSolxQuantity)} SOLX
          <br />
          <Info>
            <WriteContract /> > 10. setMinSolxQuantity (18 decimals): {minSolxQuantity?.toString()}
          </Info>
        </li>
      </ul>

      <h3>Fees</h3>
      <ul>
        <li>
          Listing fee: {saleFee?.toString()}%
          <br />
          <Info>
            <WriteContract /> > 12. setSaleFeePercent (no decimals): {saleFee?.toString()}
          </Info>
        </li>
        <li>
          Listing fee minimum: {fmt(saleFeeFixed)} SOLX
          <br />
          <Info>
            <WriteContract /> > 11. setSaleFeeFixed (18 decimals): {saleFeeFixed?.toString()}
          </Info>
        </li>
        <li>
          Buy fee: {buyFee?.toString()}%
          <br />
          <Info>
            <WriteContract /> > 7. setBuyFeePercent (no decimals): {buyFee?.toString()}
          </Info>
        </li>
        <li>
          Buy fee minimum: {fmt(buyFeeFixed)} BUSD
          <br />
          <Info>
            <WriteContract /> > 6. setBuyFeeFixed (18 decimals): {buyFeeFixed?.toString()}
          </Info>
        </li>
      </ul>

      <h3>Stats</h3>
      <ul>
        <li>Listings count: {listingsCount?.toString()}</li>
        <li>Completed sales: {completedSales?.toString()}</li>
        <li>
          <b>Total SOLX sales: {fmt(totalSalesSolx)}</b>
        </li>
        <li>
          <b>Total BUSD sales: {fmt(totalSalesBusd)}</b>
        </li>
        <li>Total SOLX fees: {fmt(totalSolxFee)}</li>
        <li>Total BUSD fees: {fmt(totalBusdFee)}</li>
      </ul>
    </>
  );
};

const ParkPoolContract = ({ readContracts, network, tx, writeContracts }) => {
  const address = readContracts.ParkPool?.address;
  const depositEndDateBN = useContractReader(readContracts, "ParkPool", "depositEndDate");
  const totalDepositedBN = useContractReader(readContracts, "ParkPool", "totalDeposited");
  const totalRewardsDepositedBN = useContractReader(readContracts, "ParkPool", "totalRewardsDeposited");
  const totalClaimedRewardsBN = useContractReader(readContracts, "ParkPool", "totalClaimedRewards");
  const totalClaimableRewardsBN = useContractReader(readContracts, "ParkPool", "totalClaimableRewards");
  const depositEndDate = depositEndDateBN ? format(new Date(depositEndDateBN.toNumber() * 1000), "d MMM yyyy") : null;

  const [newEndDateTimestamp, setNewEndDateTimestamp] = useState("");
  const onDateChange = (date, dateStr) => {
    setNewEndDateTimestamp(dateStr ? String(new Date(dateStr).getTime() / 1000) : "");
  };

  return (
    <>
      <ul>
        <li>
          Contract address: <AddressLink address={address} network={network} />
        </li>
        <li>Deposit end date: {depositEndDate?.toString()} </li>
        <li>Total SOLX deposited: {withDecimals(totalDepositedBN)} SOLX</li>
        <li>Total rewards deposited: {withDecimals(totalRewardsDepositedBN)} BNB</li>
        <li>Rewards claimed already: {withDecimals(totalClaimedRewardsBN)} BNB</li>
        <li>Rewards left to claim: {withDecimals(totalClaimableRewardsBN)} BNB</li>
      </ul>

      <DepositParkReward {...{ tx, writeContracts }} />

      <h3>Actions</h3>
      <ul>
        <li>
          Change deposit end date
          <br />
          <Info>
            <WriteContract address={address} /> > setDepositEndDate({newEndDateTimestamp})
            <br />
            <DatePicker onChange={onDateChange} />
          </Info>
        </li>
        <li>
          Withdraw SOLX
          <br />
          <Info>
            <WriteContract address={address} /> > withdrawToken
            <br />
            <div>
              Params:
              <ul>
                <li>
                  SOLX token address: <AddressLink address={readContracts.SoleraX?.address} network={network} />
                </li>
                <li>amount to withdraw with 18 decimals</li>
              </ul>
            </div>
          </Info>
        </li>
        <li>
          Withdraw BNB
          <br />
          <Info>
            <WriteContract address={address} /> > withdrawBNB (18 decimals)
          </Info>
        </li>
      </ul>
    </>
  );
};

export const Admin = ({ readContracts, network, tx, writeContracts }) => {
  const onTabChange = key => console.log(`changed to tab:`, key);

  return (
    <PageWrap css={{ textAlign: "left", maxWidth: 700 }}>
      <Tabs defaultActiveKey="parkPool" onChange={onTabChange}>
        <TabPane tab="Park Pool" key="parkPool">
          <ParkPoolContract {...{ readContracts, network, tx, writeContracts }} />
        </TabPane>
        <TabPane tab="Public Sale V2" key="publicSaleV2">
          <PublicSaleContract {...{ readContracts, network, contractName: "PublicSaleV2" }} />
        </TabPane>
        <TabPane tab="Public Sale" key="publicSale">
          <PublicSaleContract {...{ readContracts, network }} />
        </TabPane>
        <TabPane tab="Vesting" key="vesting">
          <VestingContract {...{ readContracts, network }} />
        </TabPane>
        <TabPane tab="Exchange" key="exchange">
          <ExchangeContract {...{ readContracts, network }} />
        </TabPane>
      </Tabs>
      <p>
        BSCscan unit converter:{" "}
        <a href={"https://bscscan.com/unitconverter"} target={"_blank"}>
          https://bscscan.com/unitconverter
        </a>
      </p>
    </PageWrap>
  );
};
