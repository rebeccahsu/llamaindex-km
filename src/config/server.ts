// import appRoot from 'app-root-path'
import fs from 'fs'

import is from '../utils/is'

const appRoot = process.cwd();

// let version = 'unknown'
// try {
//   version = fs.readFileSync(`${appRoot}/version`).toString().replace('\n', '')
// } catch (e) {
//   console.log('read version error', e)
// }

const config = {
  mode: process.env.SERVER_ENV || 'local',
  logLevel: process.env.LOG_LEVEL || 'debug',
  worker: false,

  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  token: {
    key: 'auth',
    secret: process.env.SECRET || '1b)-Ro:NssCHd3xGxF1Z',
    expires: 1000 * 60 * 60 * 24
  },
  tls: is.truely(process.env.TLS_ENABLE),
  wwwRedirect: is.truely(process.env.WWW_REDIRECT),

  // version: `${process.env.npm_package_version || 'unknown'}-${version}`,
  podName: process.env.NODE_POD_NAME || 'localhost',

  apiDomain: process.env.API_DOMAIN || 'localhost:3000',
  frontendDomain: process.env.FRONTEND_DOMAIN || 'localhost:3000',

  projectId: process.env.PROJECT_ID || 'km',
}

export default config
