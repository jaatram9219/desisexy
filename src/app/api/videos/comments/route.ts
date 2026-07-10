import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'

// GET /api/videos/comments?videoId=... - Fetch comments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(comments)
  } catch (error: any) {
    console.error('Fetch comments error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/videos/comments - Create a comment (authenticated)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('user_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 })
    }

    const payload = await verifyJWT(sessionToken)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { videoId, content } = await request.json()

    if (!videoId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Video ID and content are required' }, { status: 400 })
    }

    // Verify video exists
    const videoExists = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!videoExists) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: payload.userId,
        videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE /api/videos/comments?commentId=... - Delete a comment
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('user_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(sessionToken)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Fetch comment to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Only allow comment owner, admin, owner, or moderator to delete comments
    const isOwner = comment.userId === payload.userId
    const isAdmin = ['OWNER', 'ADMIN', 'MODERATOR'].includes(payload.role || '')

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
