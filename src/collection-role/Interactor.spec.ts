import { Assign, Edit, Remove } from '../collection-role/Interactor';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
const driver = new MockDriver(); // DataStore
const expect = require('chai').expect;

describe('Assign.start', () => {
  it('should add the role of a user in a collection', (done) => {
    return Assign.start(
        driver,
        MOCK_OBJECTS.USER,
        MOCK_OBJECTS.COLLECTION,
        MOCK_OBJECTS.USER_ID,
        MOCK_OBJECTS.ROLE)
      .then((val) => {
        expect(val).to.exist;
        done();
      })
        .catch((error) => {
          expect.fail();
          done();
        });
  });
});

describe('Edit.start', () => {
  it('should update the role of a user in a collection', (done) => {
    return Edit.start(
        driver,
        MOCK_OBJECTS.USER,
        MOCK_OBJECTS.COLLECTION,
        MOCK_OBJECTS.USER_ID,
        MOCK_OBJECTS.ROLE)
      .then((val) => {
        expect(val).to.exist;
        done();
      })
      .catch((error) => {
        expect.fail();
        done();
      });
  });
});

describe('Remove.start', () => {
  it('should add the role of a user in a collection', (done) => {
    return Remove.start(
        driver,
        MOCK_OBJECTS.USER,
        MOCK_OBJECTS.COLLECTION,
        MOCK_OBJECTS.USER_ID,
        MOCK_OBJECTS.ROLE)
          .then((val) => {
            expect(val).to.exist;
            done();
          })
          .catch((error) => {
            expect.fail();
            done();
          });
  });
});
