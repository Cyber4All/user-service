// import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
// import MongoDriver from '../drivers/MongoDriver';
// import RouteResponder from '../drivers/RouteResponder';
// import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';

// const expect = require('chai').expect;
// const driver = new MongoDriver; // DataStore 
// // const responder = new RouteResponder; // Responder
// const dburi = process.env.CLARK_DB_URI_DEV.replace(
//     /<DB_PASSWORD>/g,
//     process.env.CLARK_DB_PWD
//   )
//   .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
//   .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);

// // ** generateOTACode **
// // params (dataStore: DataStore, action: ACCOUNT_ACTIONS, email: String)
// // success - returns an otaCode: String
// // failure - returns Promise.reject('Invalid action'); || Promise.reject(e)
// describe('generateOTACode', () => {
//     // Test 1: Provide expected input 
//   it('should return an OTACode', done => {
//     driver.connect(dburi).then(val => {
//       const email = 'nvisal1@students.towson.edu';
//       return OTACodeInteractor.generateOTACode
//       (driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
//         expect(val, 'Did not return OTACode').to.be.a('string'); 
//         done();
//       }).catch((error) => {
//         console.log(error);
//         expect.fail();
//         done();
//       });
//     }).catch((error) => {
//       console.log(error);
//       expect.fail();
//       done();
//     });
//   });
//     // Test 2: Provide unexpected input 
//     it('should return an error - empty email was given', done => {
//         driver.connect(dburi).then(val => {
//           const email = '';
//           return OTACodeInteractor.generateOTACode
//           (driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
//             expect.fail(); 
//             done();
//           }).catch((error) => {
//             console.log(error);
//             expect(error).to.be.a('string');
//             done();
//           });
//         }).catch((error) => {
//           console.log(error);
//           expect.fail();
//           done();
//         });
//       });
// });

// // ** decode **
// // params (dataStore: DataStore, otaCode: String)
// // success - returns decoded;
// // failure - returns Promise.reject(e);
// describe('decode', () => {
//     // Test 1: Provide expected input 
//   it('should return decoded', done => {
//     driver.connect(dburi).then(val => {
//       const email = 'nvisal1@students.towson.edu';
//       OTACodeInteractor.generateOTACode(driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
//         return OTACodeInteractor.decode(driver, val).then(val => {
//           expect(val, 'Did not return decoded').to.be.a('object'); 
//           done();
//         });
//       }).catch((error) => {
//         console.log(error);
//         expect.fail();
//         done();
//       });
//     }).catch((error) => {
//       console.log(error);
//       expect.fail();
//       done();
//     });
//   });
//     // Test 2: Provide unexpected input 
//     it('should return an error - empty email was given!', done => {
//         driver.connect(dburi).then(val => {
//           const email = '';
//           OTACodeInteractor.generateOTACode(driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
//             return OTACodeInteractor.decode(driver, val).then(val => {
//               expect.fail();
//               done();
//             });
//           }).catch((error) => {
//             expect(error, 'Did not return decoded').to.be.a('string'); 
//             done();
//           });
//         }).catch((error) => {
//           console.log(error);
//           expect.fail();
//           done();
//         });
//       });
// });

// // ** applyOTACode **
// // params (dataStore: DataStore, otaCode: String)
// // success - returns otaCode.code;
// // failure - returns Promise.reject(e); || Promise.reject('Invalid email');
// describe('applyOTACode', () => {
//    // Test 1: Provide expected input 
//   it('should return decoded', done => {
//     driver.connect(dburi).then(val => {
//       const email = 'nvisal1@students.towson.edu';
//       OTACodeInteractor.generateOTACode(driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
//         return OTACodeInteractor.applyOTACode(driver, val).then(val => {
//           expect(val, 'Did not return decoded').to.be.a('object'); 
//           done();
//         }).catch((error) => {
//           console.log(error);
//           expect.fail();
//           done();
//         });
//       }).catch((error) => {
//         console.log(error);
//         expect.fail();
//         done();
//       });
//     }).catch((error) => {
//       console.log(error);
//       expect.fail();
//       done();
//     });
//   });
  
