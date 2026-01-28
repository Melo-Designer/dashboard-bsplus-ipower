'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { getImageUrl } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  author: string | null
  published: boolean
  publishedAt: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
}

interface BlogCardProps {
  post: BlogPost
  onTogglePublished: (post: BlogPost) => void
  onDelete: (id: string) => void
}

export function BlogCard({ post, onTogglePublished, onDelete }: BlogCardProps) {
  return (
    <div className="group relative rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Featured Image */}
      <div className="relative h-40 bg-light-grey">
        {post.featuredImage ? (
          <Image
            src={getImageUrl(post.featuredImage)}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-text-color/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        {!post.published && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary">Entwurf</Badge>
          </div>
        )}

        {/* Category Badge */}
        {post.category && (
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="bg-secondary/90">
              {post.category.name}
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link
            href={`/blog/${post.id}`}
            className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-text-color hover:bg-light-grey transition-colors"
          >
            Bearbeiten
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-color truncate">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-text-color/60 line-clamp-2 mt-1">
                {post.excerpt}
              </p>
            )}
          </div>
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 text-text-color/30 hover:text-red-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-3 text-xs text-text-color/50">
          {post.author && (
            <>
              <span>{post.author}</span>
              <span className="text-text-color/30">|</span>
            </>
          )}
          {post.publishedAt && (
            <span>{format(new Date(post.publishedAt), 'dd. MMM yyyy', { locale: de })}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end mt-4 pt-3 border-t border-light-grey">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-color/50">Veröffentlicht</span>
            <Switch
              checked={post.published}
              onCheckedChange={() => onTogglePublished(post)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
