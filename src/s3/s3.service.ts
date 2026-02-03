import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Multer } from 'multer'
import * as path from 'path'
import * as crypto from 'crypto'
import { settings } from 'src/settings'
import * as sharp from 'sharp'
import { CustomLogger } from 'src/utils'

const MAX_IMAGE_DIMENSION = 2048

@Injectable()
export class S3Service {
  private readonly s3: S3Client
  private readonly logger: CustomLogger

  constructor() {
    this.s3 = new S3Client({ region: settings.aws.s3.region, credentials: settings.aws.s3.credentials })
    this.logger = new CustomLogger(S3Service.name)
  }

  /**
   * Uploads a simple test file to S3 to verify connectivity.
   * @returns A message indicating the file was uploaded to S3.
   */
  async uploadTestFile() {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: settings.aws.s3.s3BucketName,
        Key: 'hello-from-nest.txt',
        Body: 'Hello from NestJS 👋'
      })
    )

    return { message: 'File uploaded to S3' }
  }

  /**
   * Generates a pre‑signed URL for accessing an S3 object.
   * @param key - The key of the S3 object.
   * @returns The pre‑signed URL.
   */
  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: settings.aws.s3.s3BucketName,
      Key: key
    })

    return getSignedUrl(this.s3, command, { expiresIn: 3600 })
  }

  /**
   * Checks if the provided mimetype represents an image.
   * @param mimetype - The mimetype to check.
   * @returns True if the mimetype represents an image, false otherwise.
   */
  private isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/')
  }

  /**
   * Resizes the image so that the longest side is at most MAX_IMAGE_DIMENSION,
   * preserving aspect ratio. Returns the optimized buffer, or the original
   * buffer if optimization is not needed or fails.
   * @param buffer - The buffer of the image to optimize.
   * @param mimetype - The mimetype of the image.
   * @returns The optimized buffer.
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer)
      const metadata = await image.metadata()
      const { width, height } = metadata

      if (!width || !height) {
        return buffer
      }

      const needsResize = width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION

      if (!needsResize) {
        return buffer
      }

      let newWidth = width
      let newHeight = height

      if (width > height) {
        if (width > MAX_IMAGE_DIMENSION) {
          newWidth = MAX_IMAGE_DIMENSION
          newHeight = Math.round((height * MAX_IMAGE_DIMENSION) / width)
        }
      } else {
        if (height > MAX_IMAGE_DIMENSION) {
          newHeight = MAX_IMAGE_DIMENSION
          newWidth = Math.round((width * MAX_IMAGE_DIMENSION) / height)
        }
      }

      this.logger.log(
        `Image optimisation: ${width}x${height} -> ${newWidth}x${newHeight} (maximum side: ${MAX_IMAGE_DIMENSION}px)`
      )

      const optimizedBuffer = await image
        .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
        .toBuffer()

      return optimizedBuffer
    } catch (error) {
      this.logger.warn('Image optimization failed, original file is used instead:', error)
      return buffer
    }
  }

  /**
   * Optionally optimizes an image and uploads the file to S3.
   * Returns the generated S3 key.
   * @param file - The file to upload.
   * @param folder - The folder to upload the file to.
   * @returns The generated S3 key.
   */
  async uploadFile(file: Multer.File, folder: string): Promise<string> {
    const ext = path.extname(file.originalname)
    const key = `${folder}/${crypto.randomUUID()}${ext}`

    let fileBuffer = file.buffer
    let contentType = file.mimetype

    if (this.isImage(file.mimetype)) {
      fileBuffer = await this.optimizeImage(file.buffer)
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: settings.aws.s3.s3BucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType
      })
    )

    return key
  }

  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: settings.aws.s3.s3BucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType
      })
    )
  }

  async uploadBufferWithRandomKey(
    buffer: Buffer,
    folder: string,
    extension: string,
    contentType: string,
    prefix?: string
  ): Promise<string> {
    const sanitizedExtension = extension.startsWith('.') ? extension : `.${extension}`
    const keyPrefix = prefix ? `${prefix}-` : ''
    const key = `${folder}/${keyPrefix}${crypto.randomUUID()}${sanitizedExtension}`

    await this.uploadBuffer(buffer, key, contentType)

    return key
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: settings.aws.s3.s3BucketName,
        Key: key
      })
    )
  }
}
