// the side-effect of this command is to load environmental key-value pairs in .env file to process.env
require('dotenv').config();
const BigNumber = require('bignumber.js');
const moment = require('moment');
const { binanceAxios } = require('./binanceAxios');

const getTrades = async () => {
  const url = `/api/v3/myTrades`;

  const requestParams = {
    symbol: 'BTTBTC',
    timestamp: new Date().getTime()
  };

  try {
    const response = await binanceAxios.get(url, { params: requestParams });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
};

const getBalances = async () => {
  const url = `/api/v3/account`;

  const requestParams = {
    timestamp: new Date().getTime()
  };

  try {
    const response = await binanceAxios.get(url, { params: requestParams });
    const significantBalances = response.data.balances.filter((b) => b.free > 0 || b.locked > 0)
    console.log(significantBalances);
  } catch (error) {
    console.log(error);
  }
};

getBalances();
