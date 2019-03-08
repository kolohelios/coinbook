// the side-effect of this command is to load environmental key-value pairs in .env file to process.env
require('dotenv').config();
const BigNumber = require('bignumber.js');
const moment = require('moment');
const { binanceAxios } = require('./binanceAxios');
const { coinbaseAxios } = require('./coinbaseAxios');

const coinbook = [];

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

const getBinanceBalances = async () => {
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

const getBinanceOrders = async () => {
  const url = `/api/v3/openOrders`;

  const requestParams = {
    timestamp: new Date().getTime()
  };

  try {
    const response = await binanceAxios.get(url, { params: requestParams });
    const orders = response.data;
    // const significantBalances = response.data.balances.filter((b) => b.free > 0 || b.locked > 0)
    // console.log(significantBalances);
    console.log(orders);
  } catch (error) {
    console.log(error);
  }
};

const getCoinbaseBalances = async (relevantAccounts) => {
  const url = `/v2/accounts`;

  // const requestParams = {};

  try {
    const response = await coinbaseAxios.get(url);

    const relevantAccountInfo = response.data.data.filter((account) => relevantAccounts.includes(account.currency)).map((account) => {
      return {
        id: account.id,
        name: account.name,
        currency: account.currency,
      }
    });

    // console.log(relevantAccountInfo);

    const buysPerAccount = await Promise.all(relevantAccountInfo.map(async (account) => {
      const response = await coinbaseAxios.get(`/v2/accounts/${account.id}/buys`);
      const history = response.data;
      return history;
    }));

    buysPerAccount.forEach((account) => {
      account.data.filter((transaction) => transaction.status === 'completed').forEach((transaction) => {
        console.log(transaction.status);
        const normalizedTransactionObject = {
          timestamp: transaction.created_at,
          id: `coinbase_${transaction.user_reference}`,
          source: {
            currency: transaction.total.currency,
            exchangeOrWallet: 'Coinbase',
            amount: BigNumber(transaction.total.amount),
            party: '',
          },
          destination: {
            currency: transaction.amount.currency,
            exchangeOrWallet: 'Coinbase',
            amount: BigNumber(transaction.amount.amount),
            party: '',
          },
          fee: {
            currency: transaction.fees[0].amount.currency,
            exchangeOrWallet: 'Coinbase',
            amount: BigNumber(transaction.fees[0].amount.amount),
            party: 'Coinbase',
          },
        };

        coinbook.push(normalizedTransactionObject);
      });
    });

    const transactionsPerAccount = await Promise.all(relevantAccountInfo.map(async (account) => {
      const response = await coinbaseAxios.get(`/v2/accounts/${account.id}/transactions`);
      const history = response.data;
      return history;
    }));

    transactionsPerAccount.forEach((account) => {
      console.log(account);
      // account.data.filter((transaction) => transaction.status === 'completed').forEach((transaction) => {
      //   console.log(transaction.status);
      //   const normalizedTransactionObject = {
      //     timestamp: transaction.created_at,
      //     id: `coinbase_${transaction.user_reference}`,
      //     source: {
      //       currency: transaction.total.currency,
      //       exchangeOrWallet: 'Coinbase',
      //       amount: BigNumber(transaction.total.amount),
      //       party: '',
      //     },
      //     destination: {
      //       currency: transaction.amount.currency,
      //       exchangeOrWallet: 'Coinbase',
      //       amount: BigNumber(transaction.amount.amount),
      //       party: '',
      //     },
      //     fee: {
      //       currency: transaction.fees[0].amount.currency,
      //       exchangeOrWallet: 'Coinbase',
      //       amount: BigNumber(transaction.fees[0].amount.amount),
      //       party: 'Coinbase',
      //     },
      //   };

      //   coinbook.push(normalizedTransactionObject);
      // });
    });

    const summaryObject = coinbook.reduce((acc, next) => {
      acc.fee.amount = BigNumber(acc.fee.amount.plus(next.fee.amount));
      acc.source.amount = BigNumber(acc.source.amount.plus(next.source.amount));
      return acc;
    }, {
        source: {
          amount: BigNumber(0),
        },
        fee: {
          amount: BigNumber(0),
        },
      });

      console.log(summaryObject);

    // const significantBalances = response.data.balances.filter((b) => b.free > 0 || b.locked > 0)
    // console.log(significantBalances);
  } catch (error) {
    console.log(error);
  }
};

// getBinanceBalances();
getBinanceOrders();
// const coinbaseAccounts = ['ZEC', 'ETH', 'USD', 'BTC'];
// getCoinbaseBalances(coinbaseAccounts);
