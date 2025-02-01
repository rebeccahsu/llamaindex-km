import { GetSignedUrlConfig, Storage as GoogleStorage }  from '@google-cloud/storage'

import serverConfig from '../config/server'
import storageConfig from '../config/store'

const storage = new GoogleStorage({
  projectId: serverConfig.projectId,
  keyFilename: storageConfig.certs.storage
})

export default class Storage {
  static async upload(src: string, destination: string, isPublic: boolean) {
    const options = {
      destination,
      public: isPublic,
      resumable: false
    }
    return storage.bucket(storageConfig.bucketName).upload(src, options)
  }

  // /**
  //  * ${bucketName}/${srcFilename} downloaded to ${destFilename}.`
  //  */
  // static download(src: string, destination: string) {
  //   const options = {
  //     destination
  //   }
  //   return storage.bucket(storageConfig.bucketName!).file(src).download(options)
  // }

  static async writeSignedUrl(src: string, mimetype: string, size: number, conf?: GetSignedUrlConfig) {
    const options: GetSignedUrlConfig = {
      ...(conf ?? {}),
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000, // ms (1 hour)
      extensionHeaders: {
        'Content-Type': mimetype,
        'X-Upload-Content-Length': size,
        'Content-Length': size // max upload size
        // 'x-goog-content-length-range': `1,${size}` // range
      }
    }

    return storage.bucket(storageConfig.bucketName).file(src).getSignedUrl(options)
  }

  static readSignedUrl(src: string, conf?: GetSignedUrlConfig) {
    const options: GetSignedUrlConfig = {
      ...(conf ?? {}),
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000 // ms (1 hour)
    }

    return storage.bucket(storageConfig.bucketName).file(src).getSignedUrl(options)
  }

  static metadata(src: string) {
    return storage.bucket(storageConfig.bucketName).file(src).getMetadata()
  }

  static makePublic(src: string) {
    return storage.bucket(storageConfig.bucketName).file(src).makePublic()
  }

  static move(src: string, dest: string) {
    return storage.bucket(storageConfig.bucketName).file(src).move(dest)
  }

  static copy(src: string, dest: string) {
    return storage.bucket(storageConfig.bucketName).file(src).copy(dest)
  }

  /**
   * ${bucketName}/${filename} deleted.
   */
  static delete(src: string) {
    return storage.bucket(storageConfig.bucketName).file(src).delete()
  }
}
