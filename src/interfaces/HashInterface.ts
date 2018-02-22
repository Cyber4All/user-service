
export interface HashInterface {
    /**
     * Generate a hash for the given password.
     * @param {string} pwd
     *
     * @return {string} the hash, concatenated with salt and round count
     */
    hash(pwd: string): Promise<string>;

    /**
     * Test if the given password hashes to the given hash.
     * @param pwd
     * @param hash_
     *
     * @returns {boolean} true iff pwd hashes to hash
     */
    verify(pwd: string, hash: string): Promise<boolean>;
}
