<script setup lang="ts">
import { computed, ref } from 'vue'
import Text from '../Basic/Text.vue'
import CenteredLoadingIndicator from '../Basic/CenteredLoadingIndicator.vue'
import ErrorMessage from '../Basic/ErrorMessage.vue'
import ToggableInput from '../Basic/Input/ToggableInput.vue'
import SearchableDropdown, { type DropdownItem } from '../Basic/Search/SearchableDropdown.vue'
import { Messages } from '@/constants/Messages'
import { type Kitchen } from '@/models/Kitchen'
import { hasKitchenRoleAtLeast } from '@/models/KitchenRole'
import { memberDisplayName, type KitchenUserDetail } from '@/models/KitchenUser'
import {
  KITCHEN_ROLE_LABELS,
  KITCHEN_ROLES,
  kitchenRoleFromValue,
  kitchenRoleLabel,
  type KitchenRoleName,
} from '@/models/KitchenRole'

const props = withDefaults(defineProps<{
  kitchen: Kitchen
  members: KitchenUserDetail[]
  currentUserId?: string
  currentRole?: KitchenRoleName | null
  isLoading?: boolean
  isSaving?: boolean
  errorMessage?: string
  onRename?: (name: string) => void
  onRoleChange?: (userId: string, role: KitchenRoleName) => void
}>(), {
  currentUserId: '',
  currentRole: null,
  isLoading: false,
  isSaving: false,
  errorMessage: '',
})

const emit = defineEmits<{
  (e: 'rename', name: string): void
  (e: 'role-change', userId: string, role: KitchenRoleName): void
}>()


// Only admin and owner may rename the kitchen or change roles
const canManage = computed(() => hasKitchenRoleAtLeast(props.currentRole, 'admin'))

// "owner" can only be granted by the owner of the kitchen (same rule as the backend)
const allowedRoles = computed<DropdownItem<KitchenRoleName>[]>(() =>
  KITCHEN_ROLES
    .filter((role) => role !== 'owner' || props.currentRole === 'owner')
    .map((role) => ({ value: role, label: KITCHEN_ROLE_LABELS[role] }))
)

const rowItems = ref<Record<string, DropdownItem<KitchenRoleName>[]>>({})

const getRowItems = (member: KitchenUserDetail): DropdownItem<KitchenRoleName>[] => {
  return rowItems.value[member.id] ?? allowedRoles.value
}

const selectedRoleItem = (member: KitchenUserDetail): DropdownItem<KitchenRoleName> | undefined => {
  const role = kitchenRoleFromValue(member.roleName)
  return role != null ? { value: role, label: KITCHEN_ROLE_LABELS[role] } : undefined
}

const handleRowSearch = (member: KitchenUserDetail, query: string) => {
  const normalized = query.trim().toLowerCase()
  const currentLabel = selectedRoleItem(member)?.label.trim().toLowerCase() ?? ''
  // The dropdown triggers a search with its current text on focus - keep every allowed role in that case
  const showAll = normalized === '' || normalized === currentLabel
  rowItems.value = {
    ...rowItems.value,
    [member.id]: showAll
      ? allowedRoles.value
      : allowedRoles.value.filter((item) => item.label.toLowerCase().includes(normalized)),
  }
}

const canChangeRole = (member: KitchenUserDetail): boolean => {
  if (!canManage.value || member.userId === '') {
    return false
  }
  // an owner can only be demoted by another owner
  if (kitchenRoleFromValue(member.roleName) === 'owner' && props.currentRole !== 'owner') {
    return false
  }
  return true
}

const memberLabel = (member: KitchenUserDetail): string => {
  const isCurrentUser = props.currentUserId !== '' && member.userId === props.currentUserId
  return isCurrentUser ? `${memberDisplayName(member)} (you)` : memberDisplayName(member)
}

const handleRename = (name: string) => {
  if (!canManage.value) return
  props.onRename?.(name)
  emit('rename', name)
}

const handleRoleSelect = (member: KitchenUserDetail, item: DropdownItem<KitchenRoleName>) => {
  if (!canChangeRole(member)) return
  if (item.value === kitchenRoleFromValue(member.roleName)) return
  props.onRoleChange?.(member.userId, item.value)
  emit('role-change', member.userId, item.value)
}
</script>

<template>
  <div class="kitchen-management-panel">
    <ErrorMessage :visible="errorMessage !== ''" :message="errorMessage" />

    <div class="section">
      <Text content="Kitchen name" type="subtitle" variant="prim-prim" />
      <ToggableInput
        :value="kitchen.name"
        placeholder="Kitchen name"
        :disabled="!canManage"
        :isSaving="isSaving"
        :onSave="handleRename"
      />
    </div>

    <div class="section">
      <Text content="Members" type="subtitle" variant="prim-prim" />
      <CenteredLoadingIndicator v-if="isLoading" size="medium" />
      <div v-else class="members-list">
        <div v-for="member in members" :key="member.id" class="member-row">
          <Text :content="memberLabel(member)" type="body" variant="prim-prim" />
          <div class="member-role">
            <SearchableDropdown
              v-if="canChangeRole(member)"
              :placeholder="Messages.rolePlaceholder"
              :items="getRowItems(member)"
              :onSearch="(query) => handleRowSearch(member, query)"
              :onSelect="(item) => handleRoleSelect(member, item)"
              :selectedValue="selectedRoleItem(member)"
            />
            <Text v-else :content="kitchenRoleLabel(member.roleName)" type="body" variant="prim-sec" />
          </div>
        </div>
        <Text v-if="members.length === 0" content="No members" type="body" variant="prim-sec" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.kitchen-management-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  text-align: left;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.member-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  background-color: var(--paper);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

.member-role {
  min-width: 160px;
  max-width: 200px;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .member-row {
    flex-direction: column;
    align-items: stretch;
  }

  .member-role {
    min-width: 0;
    max-width: 100%;
  }
}
</style>
