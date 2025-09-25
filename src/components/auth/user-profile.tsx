'use client'

import { useAuth } from '@/hooks/use-auth'
import { SignOutButton } from './sign-out-button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function UserProfile() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline">Entrar</Button>
      </Link>
    )
  }

  const userInitials = user.email
    ?.split('@')[0]
    .split('.')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'U'

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">
          {user.user_metadata?.full_name || user.email}
        </span>
        <span className="text-xs text-gray-500">
          {user.email}
        </span>
      </div>
      <SignOutButton />
    </div>
  )
}