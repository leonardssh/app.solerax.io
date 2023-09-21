const parkPoolABI = require("./parkpool_abi.json");
const erc20ABI = require("./erc20_abi.json");

module.exports = {
  31337: {
    contracts: {
      ParkPool: {
        address: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
        abi: parkPoolABI,
      },
      SoleraX: {
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        abi: erc20ABI,
      },
    },
  },
  97: {
    contracts: {
      ParkPool: {
        address: "0xf8F53958Ae5A7f1A0a887fC8850BB6a882d9b55D",
        abi: parkPoolABI,
      },
      SoleraX: {
        address: "0x17B63383DFF09d838FFEa3d1b28084A12f3C6490",
        abi: erc20ABI,
      },
    },
  },
  56: {
    contracts: {
      ParkPool: {
        address: "0x74893D967FB2d03EE6835968d4C46C2faF5B958f",
        abi: parkPoolABI,
      },
    },
  },
};
