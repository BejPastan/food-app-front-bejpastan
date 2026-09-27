<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Text from '../Basic/Text.vue'
import type { Unit } from '@/models/Unit'
import type { GenericTileProp } from '../Basic/Search/GenericTile'
import './Tile.css'

interface UnitTileProps extends GenericTileProp<Unit> {}

const props = defineProps<UnitTileProps>()

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
    <Text v-if="data.volumeEquivalent != null" :content="`${data.volumeEquivalent} l`" type="caption" variant="paper-sec" mode="hand" />
    <Text v-if="data.desc" :content="data.desc" type="caption" variant="paper-prim" mode="hand" />
  </button>
</template>
