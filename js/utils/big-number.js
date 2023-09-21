import { formatEther, parseEther } from "ethers/lib/utils";
import { BigNumber, constants } from "ethers";

export const bigNumberFromFloat = nFloat => {
  try {
    // return BigNumber.from((nFloat * 1e9).toString()).mul(BigNumber.from((1e9).toString()));
    return parseEther(nFloat.toString());
  } catch (e) {
    console.error(`bigNumberFromFloat`, e);
    return constants.Zero;
  }
};

export const withDecimals = (bn, decimals = 4) => {
  if (!bn) {
    return null;
  }

  // BigNumber -> string
  // const remainder = bn.mod(10 ** (18 - decimals));
  // return formatEther(bn.sub(remainder));

  // BigNumber -> string -> number -> string (with truncation)
  return (+formatEther(bn)).toFixed(decimals);

  // let res = formatEther(bn);
  // const ignoredDecimals = 10 ** (18 - decimals);
  // return Math.round(res * ignoredDecimals) / ignoredDecimals;
};

export const round2 = val => Math.floor(val * 10 ** 2) / 10 ** 2;
export const round = (val, decimals = 4) => Math.floor(val * 10 ** decimals) / 10 ** decimals;

export const userPoolShare = (userDepositSOLX, totalDepositSOLX) => {
  if (totalDepositSOLX === 0) {
    return 0;
  }

  return (userDepositSOLX / totalDepositSOLX) * 100;
};
