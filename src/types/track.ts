import type { Profile, User } from './user'

export interface Track {
  audioFile: string | undefined
  audioUrl: string | undefined
  id: string
  title: string
  titleSlug: string
  description: string
  audioWaveformData: string
  audioWaveformResolution: number
  artist: User
  audioLength: number
  createdAt: string
  recordedAt: string
  favoritesCount?: number
}

export interface TrackUser {
  username: string
  id: string
  profile: Profile
}

export interface UploadTrackFormInput {
  title: string
  description: string
  file: File | null
}
