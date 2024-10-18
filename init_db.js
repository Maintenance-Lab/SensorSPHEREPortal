// const sequelize = require('./models');
// import sequelize from './models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('memory');

// Create the database
async function reset() {
    await sequelize.sync({ force: true });

    // await sequalize.models.Account.createBulk([
      // example dummy data
      // [
  //     {
  //       "AccountId": 1,
  //       "ProjectId": [101, 102],
  //       "Enabled": true,
  //       "Name": "Alice Johnson",
  //       "Email": "alice.johnson@example.com",
  //       "Password": "password123",
  //       "Meta": { "department": "Engineering", "location": "NY" },
  //       "CreatedAt": "2023-09-15T10:30:00Z",
  //       "HasChangedPassword": false,
  //       "Role": "student",
  //       "HasAvatar": false,
  //       "PinnedProjects": [201, 202]
  //     },
  //     {
  //       "AccountId": 2,
  //       "ProjectId": [103],
  //       "Enabled": true,
  //       "Name": "Bob Smith",
  //       "Email": "bob.smith@example.com",
  //       "Password": "password456",
  //       "Meta": { "department": "Science", "location": "CA" },
  //       "CreatedAt": "2023-09-16T12:45:00Z",
  //       "HasChangedPassword": true,
  //       "Role": "teacher",
  //       "HasAvatar": true,
  //       "PinnedProjects": [203, 204]
  //     },
  //     {
  //       "AccountId": 3,
  //       "ProjectId": [104, 105],
  //       "Enabled": false,
  //       "Name": "Charlie Brown",
  //       "Email": "charlie.brown@example.com",
  //       "Password": "password789",
  //       "Meta": { "department": "Math", "location": "TX" },
  //       "CreatedAt": "2023-09-17T08:20:00Z",
  //       "HasChangedPassword": false,
  //       "Role": "administrator",
  //       "HasAvatar": false,
  //       "PinnedProjects": [205]
  //     },
  //     {
  //       "AccountId": 4,
  //       "ProjectId": [106],
  //       "Enabled": true,
  //       "Name": "Daisy Evans",
  //       "Email": "daisy.evans@example.com",
  //       "Password": "password321",
  //       "Meta": { "department": "Arts", "location": "FL" },
  //       "CreatedAt": "2023-09-18T15:35:00Z",
  //       "HasChangedPassword": true,
  //       "Role": "staff",
  //       "HasAvatar": true,
  //       "PinnedProjects": [206, 207, 208]
  //     },
  //     {
  //       "AccountId": 5,
  //       "ProjectId": [107, 108],
  //       "Enabled": false,
  //       "Name": "Eva Williams",
  //       "Email": "eva.williams@example.com",
  //       "Password": "password654",
  //       "Meta": { "department": "History", "location": "IL" },
  //       "CreatedAt": "2023-09-19T09:10:00Z",
  //       "HasChangedPassword": false,
  //       "Role": "student",
  //       "HasAvatar": false,
  //       "PinnedProjects": []
  //     },
  // ]);


}

reset();







