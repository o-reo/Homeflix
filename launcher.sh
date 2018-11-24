mongod --dbpath database/mongodb-data &
cd server
node app &
cd ../client
npm run-script run &
