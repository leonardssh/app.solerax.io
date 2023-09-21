/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import differenceInDays from "date-fns/differenceInDays";
import { PageWrap } from "../../components/PageWrap";
import format from "date-fns/format";
import { useContractReader } from "eth-hooks";

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 30px;
  background-color: #f3f3f3;
  border-radius: 5px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: rgb(37, 204, 156);
  border-radius: inherit;
`;

const ParkPoolProgressBar = ({
  depositStartDate = new Date("2023-03-10"),
  depositEndDate = new Date("2023-04-20"),
}) => {
  const [percentage, setPercentage] = useState(0);
  const [daysLeft, setDaysLeft] = useState(null);

  const deadline = depositEndDate.getTime();
  const updatePercentage = () => {
    const now = new Date().getTime();
    const timeLeft = deadline - now;

    if (timeLeft > 0) {
      const totalTime = deadline - depositStartDate.getTime();
      setPercentage(((totalTime - timeLeft) / totalTime) * 100);

      setDaysLeft(differenceInDays(deadline, now));
    } else {
      setPercentage(100);
      setDaysLeft(0);
    }
  };

  useEffect(() => {
    // const intervalId = setInterval(updatePercentage, 1000);
    // return () => clearInterval(intervalId);
    updatePercentage();
  }, []);

  return (
    <PageWrap css={{ maxWidth: 400 }}>
      <h2>Deposit deadline: {format(depositEndDate, "d MMM yyyy")}</h2>
      <ProgressBarContainer>
        <ProgressBar percentage={percentage} />
      </ProgressBarContainer>
      <div css={{ textAlign: "right" }}>
        {daysLeft === 0 && <div>Deposit period is over</div>}
        {daysLeft !== null && daysLeft !== 0 && <div>{daysLeft} days left</div>}
      </div>
    </PageWrap>
  );
};

const ParkPoolProgressBarSC = ({ readContracts }) => {
  const depositEndDateBN = useContractReader(readContracts, "ParkPool", "depositEndDate");
  const depositEndDate = depositEndDateBN ? new Date(depositEndDateBN.toNumber() * 1000) : null;

  if (!depositEndDate) {
    return null;
  }

  return <ParkPoolProgressBar depositEndDate={depositEndDate} />;
};

export default ParkPoolProgressBarSC;
