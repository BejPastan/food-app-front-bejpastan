<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import TabContainer from '@/components/TabContainer.vue'
import Text from '@/components/Basic/Text.vue'
import CenteredLoadingIndicator from '@/components/Basic/CenteredLoadingIndicator.vue'
import KitchenManagementPanel from '@/components/PageComponents/KitchenManagementPanel.vue'
import Modal from '@/components/Basic/Modal.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import { Messages } from '@/constants/Messages'
import {
  getCurrentKitchenSync,
  getCurrentKitchenRoleSync,
  getKitchens,
  initKitchen,
  kitchenService,
  selectKitchen,
  subscribeCurrentKitchen,
  updateCurrentKitchen,
  type Kitchen,
} from '@/models/Kitchen'
import { kitchenUserService, type KitchenUserDetail } from '@/models/KitchenUser'
import type { KitchenRoleName } from '@/models/KitchenRole'
import { getCurrentUserSync } from '@/models/User'

const userId = ref('')
const currentKitchen = ref<Kitchen | null>(null)
const currentRole = ref<KitchenRoleName | null>(null)
const members = ref<KitchenUserDetail[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
let unsubscribeFromKitchen: (() => void) | null = null
// writes made by this view refresh its own state, so the resulting notification can be skipped
let isOwnChange = false

//#region join kitchen
const JOIN_SUCCESS_DELAY = 1200 // ms - keeps the success message visible before the modal closes
const joinModalOpen = ref(false)
const accessCode = ref('')
const isJoining = ref(false)
const joinError = ref('')
const joinSuccess = ref('')
//#endregion

const handleError = (error: unknown, message: string) => {
  console.error(message, error)
  errorMessage.value = error instanceof Error ? error.message : String(error)
}

const loadMembers = async (kitchenId: string) => {
  if (kitchenId === '') {
    members.value = []
    return
  }
  members.value = await kitchenUserService.getMembers(kitchenId, {requestedUserId: userId.value})
}

// Reads the current kitchen and membership back from the model singletons
const refreshState = async () => {
  currentKitchen.value = getCurrentKitchenSync()
  currentRole.value = getCurrentKitchenRoleSync()
  await loadMembers(currentKitchen.value?.id ?? '')
}

// Runs a model write of this view without reacting to the notification it produces
const withOwnChange = async (change: () => Promise<void>) => {
  isOwnChange = true
  try {
    await change()
  } finally {
    isOwnChange = false
  }
}

// The kitchen is only chosen with the selector in the header, so this view follows that selection
const handleKitchenChanged = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await refreshState()
  } catch (error) {
    handleError(error, 'Failed to load the kitchen')
  }
  isLoading.value = false
}

onMounted(async () => {
  userId.value = getCurrentUserSync()?.id ?? ''
  if (userId.value === '') {
    return
  }
  isLoading.value = true
  try {
    // fetches every kitchen of the user (they are the options of the header selector) and restores the selected one
    await initKitchen(userId.value, true)
    await refreshState()
  } catch (error) {
    handleError(error, 'Failed to load the kitchens')
  }
  isLoading.value = false
  unsubscribeFromKitchen = subscribeCurrentKitchen(() => {
    if (isOwnChange) {
      return
    }
    void handleKitchenChanged()
  })
})

onUnmounted(() => {
  unsubscribeFromKitchen?.()
  unsubscribeFromKitchen = null
})

const handleRename = async (name: string) => {
  isSaving.value = true
  errorMessage.value = ''
  try {
    await withOwnChange(async () => {
      await updateCurrentKitchen(name)
      currentKitchen.value = getCurrentKitchenSync()
    })
  } catch (error) {
    handleError(error, 'Failed to rename the kitchen')
  }
  isSaving.value = false
}

const handleRoleChange = async (memberUserId: string, role: KitchenRoleName) => {
  const kitchen = currentKitchen.value
  if (kitchen == null) {
    return
  }
  isSaving.value = true
  errorMessage.value = ''
  try {
    await withOwnChange(async () => {
      await kitchenUserService.changeRole(kitchen.id, memberUserId, role)
      if (memberUserId === userId.value) {
        // my own role changed - refresh the stored membership
        await selectKitchen(kitchen, userId.value)
      }
      await refreshState()
    })
  } catch (error) {
    handleError(error, 'Failed to change the role')
  }
  isSaving.value = false
}

const handleAccessCodeChange = (code: string) => {
  accessCode.value = code
  if(currentKitchen.value == null) {
    return
  }
  kitchenService.update(currentKitchen.value.id, { accessCode: code })
}

//#region join kitchen
const openJoinModal = () => {
  accessCode.value = ''
  joinError.value = ''
  joinSuccess.value = ''
  joinModalOpen.value = true
}

// The overlay/close only hides the modal - a running join request must not be interrupted
const closeJoinModal = () => {
  if (isJoining.value) {
    return
  }
  joinModalOpen.value = false
}

const handleJoin = async () => {
  const code = accessCode.value.trim()
  if (code === '' || isJoining.value || userId.value === '') {
    return
  }
  isJoining.value = true
  joinError.value = ''
  joinSuccess.value = ''
  try {
    // Joins the user to the kitchen located by the access code (the new membership is returned)
    const member = await kitchenService.join({ userId: userId.value, accessCode: code })
    joinSuccess.value = Messages.joinKitchenSuccess
    // Let the success message show before the kitchen data is reloaded
    await new Promise((resolve) => setTimeout(resolve, JOIN_SUCCESS_DELAY))
    // Fetches the joined kitchen (Kitchen.ts) and its membership (KitchenUser.ts) and makes it the current kitchen
    await withOwnChange(async () => {
      await getKitchens({ name: '' }, true)
      const kitchen = await kitchenService.getById(member.kitchenId)
      await selectKitchen(kitchen, userId.value)
    })
    joinModalOpen.value = false
    await refreshState()
  } catch (error) {
    console.error('Failed to join the kitchen', error)
    joinError.value = error instanceof Error ? error.message : String(error)
  }
  isJoining.value = false
}
//#endregion
</script>

<template>
  <TabContainer>
      <Button :label="Messages.joinKitchenButton" :onPress="openJoinModal" size="small" buttonType="sec" />

    <div class="kitchen-view">
      <CenteredLoadingIndicator v-if="isLoading && currentKitchen == null" :message="Messages.loadingMessage" />
      <Text
        v-else-if="currentKitchen == null"
        :content="Messages.noKitchensMessage"
        type="subtitle"
        variant="prim-prim"
      />
      <template v-else>
        <div v-if="currentKitchen != null" class="kitchen-view-header">
          <Text :content="currentKitchen.name" type="title" variant="prim-prim" />
          <Text :content="Messages.switchKitchenHint" type="caption" variant="sec-sec" />
        </div>
        <KitchenManagementPanel
          v-if="currentKitchen != null"
          :kitchen="currentKitchen"
          :members="members"
          :currentUserId="userId"
          :currentRole="currentRole"
          :isLoading="isLoading"
          :isSaving="isSaving"
          :errorMessage="errorMessage"
          :onRename="handleRename"
          :onRoleChange="handleRoleChange"
          :onAccessCodeChange="handleAccessCodeChange"
        />
      </template>

      <Modal :isOpen="joinModalOpen" @close="closeJoinModal">
        <div class="join-modal-content">
          <Text :content="Messages.joinKitchenTitle" type="title" variant="paper-prim" />
          <Text :content="Messages.joinKitchenPrompt" type="body" variant="paper-sec" />
          <Input
            :value="accessCode"
            :placeholder="Messages.accessCodePlaceholder"
            :onChangeText="(v: string) => accessCode = v"
            inputType="text"
            :disabled="isJoining"
            variant="paper"
          />
          <ErrorMessage :message="joinError" :visible="!!joinError" />
          <Text
            v-if="joinSuccess !== ''"
            :content="joinSuccess"
            type="caption"
            variant="paper-sec"
          />
          <div class="join-modal-actions">
            <Button
              label="Join"
              :onPress="handleJoin"
              :disabled="isJoining || accessCode.trim() === ''"
            />
            <Button
              label="Cancel"
              buttonType="sec"
              :onPress="closeJoinModal"
              :disabled="isJoining"
            />
          </div>
        </div>
      </Modal>
    </div>
  </TabContainer>
</template>

<style scoped>
.kitchen-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) 0;
  height: 100%;
}

.kitchen-view-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.join-modal-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  text-align: center;
}

.join-modal-actions {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-md);
  width: 100%;
}
</style>
