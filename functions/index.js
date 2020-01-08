const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const adminApp = admin.initializeApp();

// var serviceAccount = require("../pthg-6750e-firebase-adminsdk-ytjyx-c8d1568c1c.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://pthg-6750e.firebaseio.com"
//   });


exports.AdminDeleteUser = functions.https.onCall((data) => {
  return adminApp.auth().deleteUser(data.uid)
    .then(function () {
      return 'Successfully deleted user'
    })
    .catch(function (error) {
      return 'Error deleting user:' + error
    });
});


exports.AdminUpdateUser = functions.https.onCall((data) => {
  return adminApp.auth().updateUser(data.uid, data)
    .then(function (res) {
      return res
    })
    .catch(function (error) {
      return 'Error :' + error
    });
});


//   exports.getUserByEmail = functions.https.onCall((data, context) => {
//     // get user and add admin custom claim
//     return adminApp.auth().getUserByEmail(data.email).then(user => {
//       return  user.toJSON()
//     }).catch(err => {
//         return err;
//     })
//   })

//     exports.listUsers = functions.https.onCall((data, context) => {
//       return adminApp.auth().listUsers().then(listUsersResult => {
//         let users = []
//         listUsersResult.users.forEach((userRecord)=> {
//           users.push(userRecord.toJSON())
//         })
//         return users
//       }).catch(err => {
//           return err;
//       }) 
//     }) 
