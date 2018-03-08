export interface HashInterface {
  /**
   * Generate a hash for the given password.
   * @param {string} password
   *
   * @return {string} the hash, concatenated with salt and round count
   */
  hash(password: string): Promise<string>;

  /**
   * Test if the given password hashes to the given hash.
   * @param password
   * @param hash_
   *
   * @returns {boolean} true iff password hashes to hash
   */
  verify(password: string, hash: string): Promise<boolean>;
}
