export const evmErrorMessage = e => {
  if (e?.error?.body && typeof e.error.body) {
    try {
      const errBody = JSON.parse(e.error.body);
      return errBody?.error?.message;
    } catch (jsonParseErr) {
      return null;
    }
  }

  return null;
};

export const logTransactionUpdate = (update, functionName) => {
  console.log(`${functionName} transaction ${update.hash} finished!`);
  console.log(
    " ⛽️ " +
      update.gasUsed +
      "/" +
      (update.gasLimit || update.gas) +
      " @ " +
      parseFloat(update.gasPrice) / 1000000000 +
      " gwei",
  );
};
