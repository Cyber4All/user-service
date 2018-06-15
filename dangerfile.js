import {warn, danger} from "danger"

const newFiles = danger.git.created_files;

const EXTENSION = '.js';
const filesWithoutTests = [];

// Rule 1: New files must come with tests.
if (newFiles.length > 0) {
  for (file of newFiles) {
    // Only check non-spec files
    if (!file.endsWith(`spec${EXTENSION}`)) {
      // Get the filename up to the extension
      // This guarentees spec files are committed next to the relevant production code
      const filenameWithoutExtension = file.split(EXTENSION)[0];
      expectedSpecFile = `${filenameWithoutExtension}.spec${EXTENSION}`;

      if (!newFiles.includes(expectedSpecFile)) {
        filesWithoutTests.push(file);
      }
    }
  }
}
warn(
  `The following new files do not have associated spec files included: ${filesWithoutTests.toString()}.`
);
