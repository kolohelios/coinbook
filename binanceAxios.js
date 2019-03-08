const axios = require('axios');
const crypto = require('crypto');
const queryString = require('querystring');

const binanceAxios = axios.create();

const binanceAPIKey = process.env.BINANCE_API_KEY;
const binanceSecretKey = process.env.BINANCE_API_SECRET_KEY;

const baseURL = 'https://api.binance.com';

binanceAxios.baseURL = baseURL;

binanceAxios.interceptors.request.use((config) => {
  const hmac = crypto.createHmac('sha256', binanceSecretKey);

  config.headers['X-MBX-APIKEY'] = binanceAPIKey;
  config.url = config.url.includes('http') ? config.url : `${baseURL}${config.url}`;

  const queryParamString = queryString.stringify(config.params);
  hmac.update(queryParamString);
  const signature = hmac.digest('hex');

  config.params.signature = signature;

  return config;
}, (error) => {
  // TODO do something with request error
  return Promise.reject(error);
});

module.exports = {
  binanceAxios
};
