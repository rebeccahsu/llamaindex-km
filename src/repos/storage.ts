import { CopyResponse, MoveResponse }  from '@google-cloud/storage'
import async from 'async'
import path from 'path'

import { CError } from '../common/error'
import storageConfig from '../config/store'
import log from '../modules/logger'
import Storage from '../modules/storage'
import Random, { Normal } from '../utils/random'
import { Readable } from 'stream'

export enum EFolder {
  DocumentFile = 'document-file',
  Temp = 'temp'
}

export interface File {
  /** Name of the form field associated with this file. */
  fieldname?: string;
  /** Name of the file on the uploader's computer. */
  originalname: string;
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;
  /** Value of the `Content-Type` header for this file. */
  mimetype: string;
  /** Size of the file in bytes. */
  size: number;
  /**
   * A readable stream of this file. Only available to the `_handleFile`
   * callback for custom `StorageEngine`s.
   */
  stream?: Readable;
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination?: string;
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string;
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string;
  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer: Buffer;
}

export interface publicMetadata {
  kind: string,
  object: string,
  generation: string,
  id: string,
  selfLink: string,
  bucket: string,
  entity: string,
  role: string,
  etag: string
}

export default class StorageRepo {
  static toUrl(folder: EFolder, id: string, filename?: string | null) {
    return filename ? `https://storage.googleapis.com/${storageConfig.bucketName}/${folder}/${id}/${filename}` : null
  }

  static toFileName(folder: EFolder, id: string, url: string) {
    return url.split(`https://storage.googleapis.com/${storageConfig.bucketName}/${folder}/${id}/`)[1]
  }

  static async getWriteSignedUrl(
    files: ({
      id: string
      src: string
      mimetype: string
      size: number
    })[]
  ) {
    console.log('----getWriteSignedUrl----', files)
    try {
      return await Promise.all(
        files.map(async (file) => {
          const [url] = await Storage.writeSignedUrl(file.src, file.mimetype, file.size)

          return {
            id: file.id,
            url
          }
        })
      )
    } catch (err) {
      log.warn(err)
      console.log('get write signed url failed', JSON.stringify(err))
      throw new CError(412, 'get write signed url failed')
    }
  }


  /**
   * @see https://cloud.google.com/storage/docs/samples/storage-get-metadata#storage_get_metadata-nodejs
   */
  static async getMetadatas(
    files: ({
      id: string
      src: string
    })[]
  ) {
    return Promise.all(
      files.map(async (file) => {
        const [metadata] = await Storage.metadata(file.src)

        /**
         * {
         *   "kind": "storage#object",
         *   "id": "findhunt-dev/land/2/SxUBVqEyl2Yv.jpg/1656053084444889",
         *   "selfLink": "https://www.googleapis.com/storage/v1/b/findhunt-dev/o/land%2F2%2FSxUBVqEyl2Yv.jpg",
         *   "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/findhunt-dev/o/land%2F2%2FSxUBVqEyl2Yv.jpg?generation=1656053084444889&alt=media",
         *   "name": "land/2/SxUBVqEyl2Yv.jpg",
         *   "bucket": "findhunt-dev",
         *   "generation": "1656053084444889",
         *   "metageneration": "1",
         *   "contentType": "image/jpeg",
         *   "storageClass": "STANDARD",
         *   "size": "67087",
         *   "md5Hash": "55yU7wqOBxsxmlqmssqdhA==",
         *   "crc32c": "97YUbA==",
         *   "etag": "CNmxz76+xfgCEAE=",
         *   "timeCreated": "2022-06-24T06:44:44.447Z",
         *   "updated": "2022-06-24T06:44:44.447Z",
         *   "timeStorageClassUpdated": "2022-06-24T06:44:44.447Z"
         * }
         */
        return {
          id: file.id,
          metadata: {
            kind: metadata.kind as string,
            id: metadata.id as string,
            selfLink: metadata.selfLink as string,
            mediaLink: metadata.mediaLink as string,
            name: metadata.name as string,
            size: metadata.size as string,
            storageClass: metadata.storageClass as string,
            bucket: metadata.bucket as string,
            contentType: metadata.contentType as string,
            cacheControl: metadata.cacheControl as string,
            md5Hash: metadata.md5Hash as string,
            crc32c: metadata.crc32c as string,
            etag: metadata.etag as string,
            timeCreated: metadata.timeCreated as string,
            updated: metadata.updated as string,
            timeStorageClassUpdated: metadata.timeStorageClassUpdated as string
          }
        }
      })
    )
  }

  static async makePublic(sources: string[]) {
    return async.series(
      sources.map((src) => async.asyncify(() => Storage.makePublic(src)))
    )
  }

  static async move(src: string, dest: string, retry = 3): Promise<MoveResponse> {
    try {
      return await Storage.move(src, dest)
    } catch (err) {
      if (retry <= 0) {
        log.warn(err)
        throw new CError(412, 'move failed')
      }
      return StorageRepo.move(src, dest, retry - 1)
    }
  }

  static async copy(src: string, dest: string, retry = 3): Promise<CopyResponse> {
    try {
      return await Storage.copy(src, dest)
    } catch (err) {
      if (retry <= 0) {
        log.warn(err)
        throw new CError(412, 'copy failed')
      }
      return StorageRepo.copy(src, dest, retry - 1)
    }
  }

  static async uploadImage(relativePath: string, file: File, isPublic = false, assignedFileName?: string) {
    try {
      const parsed = path.parse(file.filename)
      const filename = assignedFileName ?? `${Random.string(16, Normal)}${parsed.ext}`
      const dest = `${relativePath}/${filename}`

      await Storage.upload(file.path, dest, isPublic)

      return filename
    } catch (err) {
      log.warn(err)
      throw new CError(412, 'upload image failed')
    }
  }

  static async uploadFile(relativePath: string, file: File, assignedFileName?: string) {
    console.log('[repos] uploadFile', relativePath, file, assignedFileName)
    try {
      const parsed = path.parse(file.filename)
      const filename = assignedFileName ?? `${Random.string(16, Normal)}${parsed.ext}`
      const dest = `${relativePath}/${filename}`

      await Storage.upload(file.path, dest, true)

      return filename
    } catch (err) {
      log.warn(err)
      console.log(JSON.stringify(err))
      throw new CError(412, 'upload file failed')
    }
  }

  static async delete(folder: EFolder, id: string, filename: string) {
    try {
      const dest = `${folder}/${id}/${filename}`
      // console.log('delete image: ', dest)

      return await Storage.delete(dest)

    } catch (err) {
      log.warn(`StorageService.delete error: ${JSON.stringify(err)}`)
      return null
    }
  }


  static async mdelete(folder: EFolder, id: string, filenames: string[]) {
    try {
      return await async.series(
        filenames.map((filename) => async.asyncify(() => StorageRepo.delete(folder, id, filename)))
      )
    } catch (err) {
      log.warn(`StorageService.deleteFile error: ${JSON.stringify(err)}`)
      return null
    }
  }

  static async imageUpdateHandler(req: {
    folder: EFolder,
    objectId: string,
    currentFileNames: string[]
    deletedImageUrls: string[]
    newFiles: Array<File>,
  }) {

    let docImages
    const { folder, objectId, currentFileNames, deletedImageUrls, newFiles } = req


    if ((newFiles.length > 0) || (deletedImageUrls.length > 0)) {
      // remove images from doc
      const deletedImageFileNames = deletedImageUrls.map((d) => StorageRepo.toFileName(folder, objectId, d))
      docImages = [...currentFileNames].filter((docImage) => !deletedImageFileNames.includes(docImage))

      // remove image from cloud storage
      deletedImageFileNames.forEach((file) => {
        StorageRepo.delete(folder, objectId, file)
      })

      // upload new image to cloud storage
      const newFileNames = (await Promise.all(newFiles.map((file) => {
        return StorageRepo.uploadImage(`${folder}/${objectId}`, file, true)
      }))).filter((f) => !!f)

      // add file names to doc.images
      docImages = docImages.concat(newFileNames as any[])
    }

    return docImages
  }
}
