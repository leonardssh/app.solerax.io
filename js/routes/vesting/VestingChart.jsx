/** @jsxImportSource @emotion/react */
import React from "react";
import format from "date-fns/format";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { COLOR } from "../../constants";
import { formatEther } from "ethers/lib/utils";
import { round2 } from "../../utils/big-number";

export const VestingChart = ({ vestingInfo, unlockTimestamps }) => {
  const vestingTotal = parseFloat(formatEther(vestingInfo.total));
  const vestingPerMonth = round2(vestingTotal / unlockTimestamps.length);

  const data = {
    labels: unlockTimestamps?.map(ts => {
      let label = format(new Date(ts.mul(1000).toNumber()), "d MMM yyyy");
      if (label.indexOf("2022")) {
        label = label.replace("2022", "");
      }
      return label;
    }),
    datasets: [
      {
        label: "SOLX tokens",
        data: unlockTimestamps.map((ts, i) =>
          i === unlockTimestamps.length - 1 ? parseFloat(formatEther(vestingInfo.total)) : (i + 1) * vestingPerMonth,
        ),
        fill: true,
        borderColor: COLOR.green,
        tension: 0.1,
        color: COLOR.white,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: COLOR.white,
          // font: {
          //   size: 18, // 'size' now within object 'font {}'
          // },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: COLOR.white, // not 'fontColor:' anymore
          // font: {
          //   size: 18, // 'size' now within object 'font {}'
          // },
          stepSize: Math.floor(vestingTotal / 5),
          beginAtZero: true,
        },
      },
      x: {
        ticks: {
          color: COLOR.white, // not 'fontColor:' anymore
          font: {
            size: 14, // 'size' now within object 'font {}'
          },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div css={{ maxWidth: 500, margin: "0 auto" }}>
      <Line data={data} type={"line"} options={options} />
    </div>
  );
};
