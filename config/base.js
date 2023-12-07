const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  server: {
    port: +(process.env.SERVER_PORT || '8080'),
  },
}