'use client'
import Link from 'next/link'
import { Heart, Star, Shield, Video, MessageCircle } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const ProfileCard = ({ profile }) => {
  const { t } = useTranslation()

  // Форматирование цены
  const formatPrice = (price) => {
    if (!price) return t('browse.contactForPrice')
    return `${price} ${profile.currency || 'USD'}/h`
  }

  // Проверка статусов
  const isVerified = profile.is_verified || false
  const hasVideo = profile.has_video || false
  const hasReviews = profile.reviews_count > 0
  const isBoosted = profile.boost_expires_at && new Date(profile.boost_expires_at) > new Date()

  return (
    <Link href={`/${profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts/${profile.id}`} className="group" aria-label={`View profile of ${profile.name}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" role="article" aria-labelledby={`profile-${profile.id}-name`}>
        
        {/* Фото профиля */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {profile.image_url ? (
            <img
              src={profile.image_url}
              alt={profile.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-gray-400 text-4xl">👤</div>
            </div>
          )}
          
          {/* Бейджи */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isVerified && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield size={12} />
                {t('browse.verified')}
              </div>
            )}
            {isBoosted && (
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                🔥 {t('browse.boosted')}
              </div>
            )}
          </div>

          {/* Счетчик лайков */}
          <div className="absolute top-2 right-2">
            <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Heart size={12} />
              {profile.likes_count || 0}
            </div>
          </div>

          {/* Индикаторы */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            {hasVideo && (
              <div className="bg-red-500 text-white p-1 rounded-full">
                <Video size={12} />
              </div>
            )}
            {hasReviews && (
              <div className="bg-blue-500 text-white p-1 rounded-full">
                <MessageCircle size={12} />
              </div>
            )}
          </div>
        </div>

        {/* Информация о профиле */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 id={`profile-${profile.id}-name`} className="font-semibold text-gray-900 dark:text-white text-lg truncate">
              {profile.name || t('browse.noName')}
            </h3>
            <div className="text-gray-500 text-sm">
              {profile.age ? `${profile.age} ${t('browse.years')}` : ''}
            </div>
          </div>

          <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            {profile.city || t('browse.noCity')}
          </div>

          {profile.height && (
            <div className="text-gray-500 text-xs mb-2">
              {profile.height}cm
              {profile.weight && ` • ${profile.weight}kg`}
              {profile.bust && ` • ${profile.bust}`}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-onlyfans-accent font-semibold">
              {formatPrice(profile.price_1hour)}
            </div>
            
            {hasReviews && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="currentColor" />
                <span className="text-xs">4.8</span>
              </div>
            )}
          </div>

          {/* Статус активности */}
          <div className="mt-2">
            {profile.is_active ? (
              <div className="text-green-600 text-xs font-medium">
                {t('browse.online')}
              </div>
            ) : (
              <div className="text-gray-500 text-xs">
                {t('browse.offline')}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProfileCard

