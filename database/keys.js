require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;


const host = DB_USER+":"+DB_PASS+"@"+DB_HOST+"/"+DB_NAME;
module.exports = {
  database: {
    URI: "mongodb+srv://"+host,
  }
};