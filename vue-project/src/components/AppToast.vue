<template>
  <div class="toast-container" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="item in notifications"
        :key="item.id"
        :class="['toast-item', item.type]"
        @click="removeNotification(item.id)"
      >
        {{ item.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { notifications, removeNotification } from '@/utils/notify'
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 360px;
}

.toast-item {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  word-break: break-word;
}

.toast-item.info {
  background: #2f6fed;
}

.toast-item.success {
  background: #23a55a;
}

.toast-item.error {
  background: #d93025;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
