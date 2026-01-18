import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Multer } from 'multer'
import * as path from 'path'
import * as crypto from 'crypto'
import { settings } from 'src/settings'

@Injectable()
export class S3Service {
  private readonly s3: S3Client

  constructor() {
    this.s3 = new S3Client({ region: settings.aws.s3.region, credentials: settings.aws.s3.credentials })
  }

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

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: settings.aws.s3.s3BucketName,
      Key: key
    })

    return getSignedUrl(this.s3, command, { expiresIn: 3600 })
  }

  async uploadFile(file: Multer.File, folder: string): Promise<string> {
    const ext = path.extname(file.originalname)
    const key = `${folder}/${crypto.randomUUID()}${ext}`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: settings.aws.s3.s3BucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    )

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
