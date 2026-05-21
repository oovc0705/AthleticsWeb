<script setup>
import { ref, onMounted, onErrorCaptured, watch, nextTick } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import { useUserStore } from './stores/user';
import { useRoute } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const error = ref(null);
const isLoading = ref(true);

// 捕获组件错误
onErrorCaptured((err) => {
  // 如果是401错误或网络错误，不显示错误页面
  if (err?.response?.status === 401 || err?.message?.includes('Network Error') || err?.message?.includes('timeout')) {
    return false;
  }
  error.value = err;
  return false; // 阻止错误继续向上传播
});

// 初始化用户数据
onMounted(async () => {
  try {
    await userStore.initUser();
  } catch (err) {
    // 如果是401错误，不显示错误
    if (err?.response?.status !== 401) {
      error.value = '初始化用户数据失败，请刷新页面重试';
    }
  } finally {
    isLoading.value = false;
  }
});

// 监听路由变化，确保加载状态正确
  watch(() => route.path, async () => {
    await nextTick();
    // 确保加载状态为false
    isLoading.value = false;
    // 清除错误状态
    error.value = null;
  });

  // 监听登录状态变化
  watch(() => userStore.isLoggedIn, (isLoggedIn) => {
    // 如果退出登录，清除错误状态
    if (!isLoggedIn) {
      error.value = null;
      isLoading.value = false;
    }
  });
</script>

<template>
  <div id="app">
    <template v-if="isLoading">
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </template>
    
    <template v-else-if="error">
      <div class="error-overlay">
        <div class="error-message">
          <h2>出错了</h2>
          <p>{{ typeof error === 'string' ? error : '应用程序加载失败' }}</p>
          <button @click="window.location.reload()" class="retry-button">
            重新加载
          </button>
        </div>
      </div>
    </template>
    
    <template v-else>
      <AppHeader />
      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <Suspense>
            <component :is="Component" />
            <template #fallback>
              <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
              </div>
            </template>
          </Suspense>
        </RouterView>
      </main>
      <AppFooter />
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 加载动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay,
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-light);
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--border-color);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-message {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
  background: var(--element-bg);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-message h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1.5rem;
  padding: 0.5rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: var(--primary-dark);
}

html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
}

#app {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>
