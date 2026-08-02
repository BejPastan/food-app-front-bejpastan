<script setup lang="ts">
import { computed } from 'vue'
import './Text.css'

export type TextVariants = 'prim-prim' | 'prim-sec' | 'sec-prim' | 'sec-sec' | 'paper-prim' | 'paper-sec' | 'warning'
export type TextTypes = 'title' | 'subtitle' | 'body' | 'caption' | 'input'
export type TextModes = 'typed' | 'hand'

const props = withDefaults(defineProps<{
  content: string
  variant?: TextVariants
  type?: TextTypes
  mode?: TextModes
}>(), {
  variant: 'prim-prim',
  type: 'body',
  mode: 'typed',
})

const colorClass = computed(() => `text-color-${props.variant}`)
const modeClass = computed(() => `text-${props.mode}`)
</script>

<template>
  <span
    class="text"
    :class="[colorClass, modeClass, type]"
  >
    {{ content }}
  </span>
</template>

<style scoped>
.text {
  margin: 0;
  line-height: 1.4;
}
</style>