'use client'

import React, { useEffect, useState } from 'react'
import { Heart, Calendar, Tag, Link as LinkIcon, Check, ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import CustomPlayer from '@/components/CustomPlayer'
import Link from 'next/link'
import { Video } from '@/lib/dbService'
import AuthModal from '@/components/AuthModal'

interface WatchPageClientProps {
  video: Video
  relatedVideos: Video[]
  categoryName: string
}

export default function WatchPageClient({ video, relatedVideos, categoryName }: WatchPageClientProps) {
  const { favorites, toggleFavorite, addToHistory, isTheaterMode, setIsTheaterMode, currentUser } = useApp()
  const [isCopied, setIsCopied] = useState(false)
  const [ratingPercent] = useState(92 + (video.views % 8))

  // Interactive likes and dislikes state (seeded deterministically from views)
  const baseLikes = Math.max(10, Math.floor(video.views * 0.08))
  const baseDislikes = Math.max(1, Math.floor(video.views * 0.002))
  const [likes, setLikes] = useState(baseLikes)
  const [dislikes, setDislikes] = useState(baseDislikes)
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null)

  // Comments State
  const [comments, setComments] = useState<any[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [postingComment, setPostingComment] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login')

  const openAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode)
    setAuthModalOpen(true)
  }

  const isFavorited = favorites.includes(video.id)

  // Increment views and add to history on mount
  useEffect(() => {
    addToHistory(video.id)
    
    // Call views increment API
    fetch(`/api/videos/views?id=${video.id}`, { method: 'POST' })
      .catch(err => console.error('Failed to increment views:', err))
  }, [video.id, addToHistory])

  // Fetch comments
  useEffect(() => {
    async function getComments() {
      try {
        const res = await fetch(`/api/videos/comments?videoId=${video.id}`)
        if (res.ok) {
          const data = await res.json()
          setComments(data)
        }
      } catch (err) {
        console.error('Failed to load comments:', err)
      } finally {
        setCommentsLoading(false)
      }
    }
    getComments()
  }, [video.id])

  const copyToClipboard = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Watch ${video.title} on DesiSexy!`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const handleLike = () => {
    if (userVote === 'like') {
      setUserVote(null)
      setLikes(prev => prev - 1)
    } else {
      if (userVote === 'dislike') {
        setDislikes(prev => prev - 1)
      }
      setUserVote('like')
      setLikes(prev => prev + 1)
    }
  }

  const handleDislike = () => {
    if (userVote === 'dislike') {
      setUserVote(null)
      setDislikes(prev => prev - 1)
    } else {
      if (userVote === 'like') {
        setLikes(prev => prev - 1)
      }
      setUserVote('dislike')
      setDislikes(prev => prev + 1)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    if (!currentUser) {
      openAuth('login')
      return
    }

    setPostingComment(true)
    try {
      const res = await fetch('/api/videos/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, content: newCommentText }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments(prev => [newComment, ...prev])
        setNewCommentText('')
      }
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setPostingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      const res = await fetch(`/api/videos/comments?commentId=${commentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  const formatDuration = (secs: number): string => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`
  }

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className={`w-full ${isTheaterMode ? 'pt-0' : 'py-6 sm:py-8'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Video & Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <CustomPlayer 
            url={video.url}
            format={video.format}
            thumbnail={video.thumbnail}
            isTheaterMode={isTheaterMode}
            onTheaterModeToggle={() => setIsTheaterMode(!isTheaterMode)}
          />

          {/* Video Meta Card */}
          <div className="bg-brand-card border border-white/5 rounded-3xl p-5 sm:p-7 space-y-5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
              {categoryName}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight">
              {video.title}
            </h1>

            {/* Date, Actions row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-b border-white/5 py-4 text-xs text-gray-400 font-semibold">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(video.createdAt).toLocaleDateString()}</span>
                
                {/* Rating Meter */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-brand-accent font-extrabold">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1 fill-brand-accent" /> {ratingPercent}%
                  </span>
                  <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-brand-accent" style={{ width: `${ratingPercent}%` }} />
                    <div className="h-full bg-neutral-600 flex-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {/* Vote Buttons */}
                <button 
                  onClick={handleLike}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                    userVote === 'like' 
                      ? 'bg-brand-accent/20 border-brand-accent text-white' 
                      : 'bg-white/5 border-white/5 hover:border-brand-accent/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{likes}</span>
                </button>
                <button 
                  onClick={handleDislike}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                    userVote === 'dislike' 
                      ? 'bg-brand-accent/20 border-brand-accent text-white' 
                      : 'bg-white/5 border-white/5 hover:border-brand-accent/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{dislikes}</span>
                </button>

                <span className="text-gray-700 font-normal px-1">|</span>

                {/* Favorite Toggle */}
                <button 
                  onClick={() => toggleFavorite(video.id)}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 cursor-pointer ${
                    isFavorited 
                      ? 'bg-brand-accent/25 border-brand-accent text-brand-accent' 
                      : 'bg-white/5 border-white/5 hover:border-brand-accent/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-brand-accent' : ''}`} />
                  <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                </button>

                {/* Share buttons group */}
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={shareOnTwitter}
                    className="p-2 bg-white/5 border border-white/5 hover:border-brand-accent/40 rounded-lg hover:text-white transition cursor-pointer flex items-center justify-center"
                    title="Share on X"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={shareOnFacebook}
                    className="p-2 bg-white/5 border border-white/5 hover:border-brand-accent/40 rounded-lg hover:text-white transition cursor-pointer flex items-center justify-center"
                    title="Share on Facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 bg-white/5 border border-white/5 hover:border-brand-accent/40 rounded-lg hover:text-white transition cursor-pointer flex items-center justify-center"
                    title="Copy Link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-semibold">
                {video.description || 'No description provided for this video.'}
              </p>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map(tag => (
                    <Link 
                      key={tag} 
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-brand-accent hover:text-white border border-white/5 rounded-lg text-xs font-bold text-gray-400 transition"
                    >
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-brand-accent" /> {tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-brand-card border border-white/5 rounded-3xl p-5 sm:p-7 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-accent" /> Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-3">
              {currentUser ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Leave a comment on this video..."
                    className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-brand-accent outline-none transition"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={postingComment || !newCommentText.trim()}
                      className="px-4 py-2 bg-brand-accent hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      {postingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center bg-black/40 border border-white/5 rounded-2xl space-y-3">
                  <p className="text-xs text-gray-400 font-semibold">You must be logged in to post comments.</p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAuth('login')}
                      className="px-4 py-1.5 bg-brand-accent hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth('register')}
                      className="px-4 py-1.5 bg-white/5 border border-white/5 hover:border-brand-accent/40 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4 font-medium">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              <div className="space-y-4 pt-2 border-t border-white/5">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-black font-extrabold text-xs uppercase shrink-0">
                      {comment.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{comment.user?.name || 'Anonymous'}</span>
                          <span className="text-[10px] text-gray-500 font-medium">{getRelativeTime(comment.createdAt)}</span>
                        </div>
                        {currentUser && (currentUser.id === comment.userId || ['OWNER', 'ADMIN', 'MODERATOR'].includes(currentUser.role)) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-500 hover:text-brand-accent opacity-0 group-hover:opacity-100 transition rounded hover:bg-white/5 cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-semibold">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column: Related Videos */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest border-l-4 border-brand-accent pl-2.5">
            Related Videos
          </h2>

          {relatedVideos.length === 0 ? (
            <p className="text-xs text-gray-600 font-semibold p-4 text-center bg-brand-card rounded-xl border border-white/5">
              No related videos in this category.
            </p>
          ) : (
            <div className="flex flex-col space-y-3">
              {relatedVideos.map(rel => (
                <div 
                  key={rel.id} 
                  className="flex bg-brand-card border border-white/5 rounded-xl overflow-hidden hover:border-brand-accent/30 transition group"
                >
                  {/* Compact Thumbnail */}
                  <Link href={`/video/${rel.slug}`} className="relative w-32 aspect-video shrink-0 bg-black/40 overflow-hidden">
                    <img 
                      src={rel.thumbnail} 
                      alt={rel.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-[9px] font-bold text-white px-1.5 py-0.2 rounded font-mono">
                      {formatDuration(rel.duration)}
                    </span>
                  </Link>

                  {/* Meta Details */}
                  <div className="p-2.5 flex flex-col justify-between overflow-hidden">
                    <Link href={`/video/${rel.slug}`}>
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-accent transition-colors line-clamp-2 leading-tight">
                        {rel.title}
                      </h4>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authInitialMode} />
    </div>
  )
}
