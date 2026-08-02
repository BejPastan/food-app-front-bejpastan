import type { Component } from 'vue'

export interface GenericFormProp<T = any> {
  data: T
  onSubmit?: (data: T) => void
}

export type GenericForm<T> = Component<GenericFormProp<T>>