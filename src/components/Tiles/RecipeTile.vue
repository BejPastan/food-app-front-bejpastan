<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Text from '../Basic/Text.vue'
import type { RecipeSimplified } from '@/models/Recipe'
import type { GenericTileProp } from '../Basic/Search/GenericTile'
import './Tile.css'

interface RecipeTileProps extends GenericTileProp<RecipeSimplified> {}

const props = defineProps<RecipeTileProps>()

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
  <button class="recipe-tile" :style="{ transform: `rotate(${rotation}deg)` }" @click="handlePress">
    <div class="magnet-container">
      <div class="magnet" @click="handleMagnetPress" />
    </div>
    <Text :content="data.name" type="subtitle" variant="paper-prim" mode="hand" />
    <Text v-if="data.time != null" :content="`${data.time} min`" type="caption" variant="paper-sec" mode="hand" />
    <Text v-if="data.portion != null" :content="`Portions: ${data.portion}`" type="caption" variant="paper-prim" mode="hand" />
  </button>
</template>