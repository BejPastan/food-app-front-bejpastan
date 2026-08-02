<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Button from '@/components/Basic/Input/Button.vue'
import Text from '@/components/Basic/Text.vue'

const props = withDefaults(defineProps<{
  initialDate?: Date
}>(), {
  initialDate: () => new Date(),
})

onMounted(() => {
  const start = getWeekStart(props.initialDate)
  const end = getWeekEnd(props.initialDate)
  weekRange.value = { start, end }
  emit('week-change', start, end)
})

const emit = defineEmits<{
  (e: 'week-change', startDate: Date, endDate: Date): void
}>()

const currentDate = ref<Date>(props.initialDate)
const weekRange = ref<{ start: Date; end: Date }>({
  start: getWeekStart(props.initialDate),
  end: getWeekEnd(props.initialDate),
})

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

watch(currentDate, (val) => {
  const start = getWeekStart(val)
  const end = getWeekEnd(val)
  weekRange.value = { start, end }
  emit('week-change', start, end)
})

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return date.toLocaleDateString(undefined, options)
}

function goPrevious() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(currentDate.value.getDate() - 7)
  currentDate.value = newDate
}

function goNext() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(currentDate.value.getDate() + 7)
  currentDate.value = newDate
}

const weekDisplayText = computed(() => {
  const start = formatDate(weekRange.value.start)
  const end = formatDate(weekRange.value.end)
  return `${start} - ${end}`
})
</script>

<template>
  <div class="container">
    <div class="button-container">
      <Button
        label=""
        leading-icon="chevron-back"
        :onPress="goPrevious"
        size="default"
        buttonType="sec"
      />
    </div>

    <div class="week-display">
      <Text :content="weekDisplayText" />
    </div>

    <div class="button-container">
      <Button
        label=""
        end-icon="chevron-forward"
        :onPress="goNext"
        size="default"
        buttonType="sec"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary);
  max-width: 400px;
  height: 64px;
  width: 100%;
  margin: 0 auto;
}

.week-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-md);
}

.button-container {
  display: flex;
  align-items: center;
  width: var(--btn-height-default);
}
</style>