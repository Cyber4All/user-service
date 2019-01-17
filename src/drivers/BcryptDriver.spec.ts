import { BcryptDriver } from "./drivers";

describe('BcryptDriver', () => {
  let bcrypt: BcryptDriver;
  beforeEach(() => {
    bcrypt = new BcryptDriver();
  });
  it('should resolve a hashed string', async () => {
    const hash = await bcrypt.hash('password');
    expect(typeof hash === 'string').toBeTruthy();
  });
});
