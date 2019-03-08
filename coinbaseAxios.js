const axios = require('axios');
const crypto = require('crypto');

const coinbaseAxios = axios.create();

const coinbaseAPIKey = process.env.COINBASE_API_KEY;
const coinbaseSecretKey = process.env.COINBASE_API_SECRET_KEY;

const baseURL = 'https://api.coinbase.com';

coinbaseAxios.baseURL = baseURL;

coinbaseAxios.interceptors.request.use((config) => {
  const hmac = crypto.createHmac('sha256', coinbaseSecretKey);

  const epochTimestamp = Math.floor(new Date().getTime() / 1000);
  const pathURL = config.url;

  config.headers['CB-ACCESS-KEY'] = coinbaseAPIKey;
  config.headers['CB-ACCESS-TIMESTAMP'] = epochTimestamp;
  config.headers['CB-VERSION'] = '2015-07-22';

  config.url = config.url.includes('http') ? config.url : `${baseURL}${config.url}`;
  // config.data = '';

  // const queryParamString = queryString.stringify(config.params);
  // TODO make the method in the signature string dependent on the HTTP request method
  const signatureString = `${epochTimestamp}GET${pathURL}`;
  hmac.update(signatureString);
  const signature = hmac.digest('hex');

  config.headers['CB-ACCESS-SIGN'] = signature;

  return config;
}, (error) => {
  // TODO do something with request error
  return Promise.reject(error.data);
});

module.exports = {
  coinbaseAxios
};
