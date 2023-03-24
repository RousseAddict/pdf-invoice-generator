const fs = require('fs')
const dotenv = require('dotenv')
const { GoogleDriveService } = require('../service/googleDriveService')

dotenv.config()

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || ''
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || ''
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || ''
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || ''
const folderName = process.env.GOOGLE_DRIVE_FOLDER_NAME || ''

async function send(filePath) {
  const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken)

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found!')
  }

  let folder = await googleDriveService.searchFolder(folderName).catch((error) => {
    console.error(error)
    return null
  });

  if (!folder) {
    folder = await googleDriveService.createFolder(folderName)
  }

  await googleDriveService.saveFile(filePath, filePath, 'application/pdf', folder.id).catch((error) => {
    console.error(error);
  });

  console.info('gdrive: File uploaded!')
}

module.exports = {
  send,
}