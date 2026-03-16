const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();

console.log("Attempting to connect with forced DNS: 8.8.8.8...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
     console.log('MongoDB Connected successfully!');
     process.exit(0);
  })
  .catch(err => {
     console.error('MongoDB connection error:', err);
     process.exit(1);
  });
