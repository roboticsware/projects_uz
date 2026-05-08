import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT?.trim(),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim() || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim() || '',
  },
})

export default defineEventHandler(async (event) => {
  // Auth guard: 로그인한 사용자만 업로드 가능
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const formData = await readFormData(event)
  const file = formData.get('image') as File | null

  if (!file || !file.size) {
    throw createError({ statusCode: 400, statusMessage: 'No image file provided' })
  }

  // 허용 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported image format. Use JPG, PNG, GIF, or WebP.' })
  }

  // 파일 크기 제한: 10MB
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw createError({ statusCode: 400, statusMessage: 'File size must be under 10MB' })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Sharp로 WebP 변환 + 리사이즈 + 압축
  const webpBuffer = await sharp(buffer)
    .resize({
      width: 1200,
      withoutEnlargement: true, // 원본보다 크게 확대하지 않음
    })
    .webp({ quality: 82 })
    .toBuffer()

  // 저장 경로: projects/<userId>/<timestamp>.webp
  const userId = session.user.id || 'anonymous'
  const key = `projects/${userId}/${Date.now()}.webp`

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME?.trim(),
    Key: key,
    Body: webpBuffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000', // 1년 브라우저 캐시
  }))

  const publicUrl = `${process.env.R2_PUBLIC_URL?.trim()}/${key}`

  return {
    success: true,
    url: publicUrl,
    originalSize: file.size,
    optimizedSize: webpBuffer.length,
    savedPercent: Math.round((1 - webpBuffer.length / file.size) * 100),
  }
})
