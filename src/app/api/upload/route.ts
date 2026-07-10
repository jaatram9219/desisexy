import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure the public/uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Create a unique filename to prevent overwrites
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = join(uploadDir, filename)

    // Write file to public/uploads
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
