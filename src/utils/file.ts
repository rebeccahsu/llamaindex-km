import mime from 'mime'

export function appendExt(name: string, mimetype?: string) {
  if (!mimetype) {
    return name
  }
  const ext = mime.getExtension(mimetype)
  return ext ? `${name}.${ext}` : name
}

export const Size = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
}

export enum EMimetype {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  BMP = 'image/bmp',

  MPEG = 'video/mpeg',
  MP4 = 'video/mp4',

  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
  AAC = 'audio/aac',
  WEBA = 'audio/webm',

  PDF = 'application/pdf',
  CSV = 'text/csv',

  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}
