import { type LocalizedText } from './helpers.js'

export interface VideoSection {
  title: LocalizedText
  description: LocalizedText
  orderIndex: number
}

export interface Video {
  title: LocalizedText
  youtubeId: string
  orderIndex: number
}
