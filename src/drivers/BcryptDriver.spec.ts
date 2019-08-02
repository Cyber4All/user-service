import { BcryptDriver } from './drivers';

/**
 * This test is here to verify that the library is working on each build.
 * Normally, we would not test that a library works properly, but we have
 * had issues with bcrypt not installing properly and crashing a deployment.
 *
 * @author Sean Donnelly <sdonne5@students.towson.edu>
 */
describe('BcryptDriver', () => {
  let bcrypt: BcryptDriver;
  beforeEach(() => {
    bcrypt = new BcryptDriver(10);
  });
  it('should resolve a hashed string', async () => {
    const hash = await bcrypt.hash('password');
    expect(typeof hash === 'string').toBeTruthy();
  });
});
