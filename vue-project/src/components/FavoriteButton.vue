<template>
  <button 
    v-if="!userStore.isAdmin"
    class="favorite-button" 
    @click="toggleFavorite"
    :aria-label="isFavorite ? t('favoriteButton.ariaLabelRemove') : t('favoriteButton.ariaLabelAdd')"
    :title="isFavorite ? t('favoriteButton.titleRemove') : t('favoriteButton.titleAdd')"
  >
    <HeartIcon :is-filled="isFavorite" :size="size" :color="isFavorite ? '#ef4444' : '#9ca3af'" />
    <span v-if="showLabel" class="ml-1 text-sm">
      {{ isFavorite ? t('favoriteButton.added') : t('favoriteButton.add') }}
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '../stores/user';
import { addToFavorites, removeFromFavorites, isFavorite as checkIsFavorite } from '../services/favoritesService';
import HeartIcon from './icons/HeartIcon.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['athlete', 'event', 'news'].includes(value)
  },
  itemId: {
    type: [String, Number],
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  showLabel: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:favorite']);

const userStore = useUserStore();
const isFavorite = ref(false);
const isLoading = ref(false);

// 检查是否已收藏
const checkFavoriteStatus = async () => {
  if (!userStore.isLoggedIn) return;
  
  try {
    isFavorite.value = await checkIsFavorite(props.type, props.itemId);
  } catch (error) {
    console.error('检查收藏状态失败:', error);
  }
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    alert(t('favoriteButton.loginRequired'));
    return;
  }
  
  if (userStore.isAdmin) {
    return;
  }

  if (isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    if (isFavorite.value) {
      await removeFromFavorites(props.type, props.itemId);
    } else {
      await addToFavorites(props.type, props.itemId);
    }
    isFavorite.value = !isFavorite.value;
    // 触发事件通知父组件
    emit('update:favorite', {
      type: props.type,
      id: props.itemId,
      isFavorite: isFavorite.value
    });
  } catch (error) {
    console.error('操作失败:', error);
    alert(error.message || '操作失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkFavoriteStatus();
});

// 监听用户登录状态变化
userStore.$subscribe(() => {
  checkFavoriteStatus();
});

// 监听itemId或type变化，重新检查收藏状态
watch(
  [() => props.itemId, () => props.type],
  () => {
    checkFavoriteStatus();
  }
);
</script>

<style scoped>
.favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: #6b7280;
}

.favorite-button:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.favorite-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}
</style>
