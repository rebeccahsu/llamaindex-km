'use server'

import path from "path"
import StorageRepo, { EFolder } from "src/repos/storage"
import { appendExt, EMimetype } from "src/utils/file"
import Random, { Normal } from 'src/utils/random'
import storageConfig from "src/config/store";

interface IFileWithNameRequest {
  name: string
  mimetype: EMimetype | string
  size: number
}

interface makePublicResponse {
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

export async function genPreSignedUrl(files: IFileWithNameRequest[], userId: string) {
  return StorageRepo.getWriteSignedUrl(
    files.map((file) => {
      const parsed = path.parse(decodeURIComponent(file.name))

      const name = appendExt(
        [parsed.name, '-', Random.string(12, Normal)].join(''),
        file.mimetype
      )

      return {
        id: name,
        src: `${EFolder.DocumentFile}/${userId}/${name}`,
        mimetype: file.mimetype,
        size: file.size
      }
    })
  )
}

export async function makePublic(path: string) {
  const [datas] = await StorageRepo.makePublic([path]);
  const metadatas = datas as makePublicResponse[];

  return {
    url: `${storageConfig.gcsDomain}/${storageConfig.bucketName}/${metadatas[0].object}`
  }
}