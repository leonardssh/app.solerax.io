/**
 * Calculate price per solx for a listing with given solxQuantity and totalPrice
 * @param listing { solxQuantity, totalPrice }
 * @return {float}
 */
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

export const ONE_ETHER = parseEther("1");

export const pricePerSolx = listing => {
  const precision = 1e4; // 4 decimals
  try {
    const priceBN = listing.totalPrice.mul(precision).div(listing.solxQuantity);
    return parseFloat(priceBN.toString()) / precision;
  } catch (e) {
    return null;
  }
};

// Copy of the calculateFee from Exchange.sol
export const calculateFee = (nBN, feePercentBN, feeFixedBN) => {
  if (nBN && feeFixedBN && feeFixedBN) {
    const variableFee = nBN.mul(feePercentBN).div(BigNumber.from("100"));
    return variableFee.gt(feeFixedBN) ? variableFee : feeFixedBN;
  }

  return null;
};

export const stringToBigNumber = n =>
  !isNaN(parseFloat(n)) ? BigNumber.from(parseFloat(n) * 1e9).mul(BigNumber.from(1e9)) : null;

/**
 * Order an array of listings by price, ASC
 * @param listings Array of Listing
 * @return {*}
 */
export const orderListingByPrice = listings =>
  listings.sort((l1, l2) => {
    const l1Price = pricePerSolx(l1);
    const l2Price = pricePerSolx(l2);
    if (l1Price && l2Price) {
      return l1Price - l2Price;
    } else {
      return 0;
    }
  });
