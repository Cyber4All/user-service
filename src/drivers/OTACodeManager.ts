/**
 * Generates unique OTA Code
 *
 * @export
 * @param {string} [seed]
 * @returns {string}
 */
export function generateOTACode(seed?: string): string {
  return 'somerandomcodetobegenerated';
}
/**
 * Verifies OTA Code
 *
 * @export
 * @param {string} otaCode
 * @returns {boolean}
 */
export function verifyOTACode(otaCode: string): boolean {
  return false;
}

export function decode(otaCode: string): OTACode {
  // Do some parsing and get properties
  return new OTACode();
}

export class OTACode {
  // Define some props;
  constructor() {}
}
