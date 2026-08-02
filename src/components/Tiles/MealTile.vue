<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Text from '../Basic/Text.vue'
import type { Meal } from '@/models/Meal'
import type { GenericTileProp } from '../Basic/Search/GenericTile'

interface MealTileProps extends GenericTileProp<Meal> {}

const props = defineProps<MealTileProps>()

const rotation = ref(0)

onMounted(() => {
  rotation.value = randomRotation()
})

function randomRotation(): number {
  const min = -2
  const max = 2
  return Math.random() * (max - min) + min
}

const handlePress = () => {
  if (props.onPress) {
    props.onPress(props.data)
  }
}

const handleMagnetPress = (event: MouseEvent) => {
  event.stopPropagation() // Prevent the click from propagating to the parent button
  if (props.onMagnetPress) {
    props.onMagnetPress(props.data)
  }
}
</script>

<template>
  <button class="meal-tile" :style="{ transform: `rotate(${rotation}deg)` }" @click="handlePress">
    <div class="magnet-container">
      <div class="magnet" @click="handleMagnetPress"/>
    </div>
    <Text :content="data.name" type="subtitle" variant="paper-prim" mode="hand" />
  </button>
</template>

<style scoped>
.meal-tile {
  transform-origin: center;
  background-color: var(--paper);
  max-width: 200px;
  gap: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-md);
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius-md);
}

.magnet-container {
  position: absolute;
  top: 4px;
  left: 55%;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  z-index: 1;
  background-color: var(--magnet-shadow);
}

.magnet {
  position: relative;
  top: -2px;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  z-index: 1;
  background-color: var(--magnet);
}
</style>