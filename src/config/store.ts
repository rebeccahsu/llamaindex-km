// import appRoot from 'app-root-path'

const appRoot = process.cwd();

const config = {
  bucketName: process.env.STORAGE_BUCKET_NAME || 'mm-km-dev',
  certs: {
    storage: process.env.STORAGE_CERT || `${appRoot}/certs/km.json`
  },
  gcsDomain: 'https://storage.googleapis.com',
}

// TODO
// add create secret command line in script


export default config