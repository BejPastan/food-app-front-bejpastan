<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Input from './Input.vue'
import Button from './Button.vue'

const props = withDefaults(defineProps<{
  value: string
  placeholder?: string
  disabled?: boolean
  isSaving?: boolean
  saveLabel?: string
  cancelLabel?: string
  editIcon?: string
  onEdit?: () => void
  onSave?: (value: string) => void
  onCancel?: () => void
}>(), {
  placeholder: '',
  disabled: false,
  isSaving: false,
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
  editIcon: 'pencil',
})

const emit = defineEmits<{
  (e: 'update:value', v: string): void
  (e: 'edit'): void
  (e: 'save', v: string): void
  (e: 'cancel'): void
}>()

const isEditing = ref(false)
const draft = ref(props.value)

// Keep the draft in sync with the outside value as long as the user is not editing
watch(() => props.value, (val) => {
  if (!isEditing.value) {
    draft.value = val
  }
})

const canSave = computed(() => draft.value.trim().length > 0 && !props.isSaving)

const handleStartEdit = () => {
  if (props.disabled || props.isSaving) return
  draft.value = props.value
  isEditing.value = true
  props.onEdit?.()
  emit('edit')
}

const handleDraftChange = (text: string) => {
  draft.value = text
}

const handleSave = () => {
  if (!canSave.value) return
  props.onSave?.(draft.value)
  emit('update:value', draft.value)
  emit('save', draft.value)
  isEditing.value = false
}

const handleCancel = () => {
  draft.value = props.value
  isEditing.value = false
  props.onCancel?.()
  emit('cancel')
}
</script>

<template>
  <div class="toggable-input-container">
    <div class="field-container">
      <Input
        v-if="isEditing"
        :value="draft"
        :placeholder="placeholder"
        :onChangeText="handleDraftChange"
        :disabled="disabled || isSaving"
      />
      <Input
        v-else
        :value="value"
        :placeholder="placeholder"
        :disabled="true"
      />
    </div>

    <div class="actions-container">
      <template v-if="isEditing">
        <Button
          :label="saveLabel"
          size="small"
          :onPress="handleSave"
          :disabled="!canSave"
        />
        <Button
          :label="cancelLabel"
          size="small"
          buttonType="sec"
          :onPress="handleCancel"
          :disabled="isSaving"
        />
      </template>
      <button
        v-else
        class="icon-btn"
        :disabled="disabled || isSaving"
        aria-label="Edit"
        @click="handleStartEdit"
      >
        <Icon :icon="`ion:${editIcon}`" width="24" height="24" :style="{ color: 'var(--text-prim-prim)' }" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toggable-input-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
}

.field-container {
  flex: 1;
  min-width: 0;
}

.actions-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.icon-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .toggable-input-container {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
