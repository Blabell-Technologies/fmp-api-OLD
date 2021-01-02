const webp = require('webp-converter');
const fs = require('fs');
const commons = require('./common.lib');
webp.grant_permission();

class UploadLibraryError extends Error {
  constructor(message) {
    super(message);

    this.name = 'Upload Library Error'
    this.message = message;
  }
}

const upload_image = async (image_url) => {
  const new_name = commons.create_uuid()
  try { await webp.cwebp(image_url, `${__dirname}/../resources/${new_name}.webp`, '-q 80'); }
  catch (error) { throw new UploadLibraryError(error) }

  try { fs.unlinkSync(image_url) }
  catch (error) { throw new UploadLibraryError(error) }

  return new_name;
}

module.exports = { upload_image }