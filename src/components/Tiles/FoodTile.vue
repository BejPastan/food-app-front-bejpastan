<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Text from '../Basic/Text.vue'
import type { Food } from '@/models/Food'
import type { GenericTileProp } from '../Basic/Search/GenericTile'
import './Tile.css'

interface FoodTileProps extends GenericTileProp<Food> {}

const props = defineProps<FoodTileProps>()

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
  event.stopPropagation()
  if (props.onMagnetPress) {
    props.onMagnetPress(props.data)
  }
}
</script>

<template>
  <button class="tile" :style="{ transform: `rotate(${rotation}deg)` }" @click="handlePress">
    <div class="magnet-container">
      <div class="magnet" @click="handleMagnetPress" />
    </div>
    <Text :content="data.name" type="subtitle" variant="paper-prim" mode="hand" />
    <Text v-if="data.foodType?.name" :content="data.foodType.name" type="caption" variant="paper-sec" mode="hand" />
  </button>
</template>
