require('dotenv').config();

const HOST = process.env.DB_HOST;


module.exports = {
  database: {
    URI: HOST,
  }
};