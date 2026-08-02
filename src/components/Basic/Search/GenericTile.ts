import type { Component } from 'vue'

export interface GenericTileProp<T = any> {
  data: T
  onPress?: (id: T) => void
  onMagnetPress?: (id: T) => void
}

export type GenericTile<T> = Component<GenericTileProp<T>>