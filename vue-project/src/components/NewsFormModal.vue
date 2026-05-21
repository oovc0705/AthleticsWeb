<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? t('newsForm.editNews') : t('newsForm.addNews') }}</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ t('newsForm.title') }}</label>
          <input v-model="form.title" required />
        </div>
        <div class="form-group">
          <label>{{ t('newsForm.category') }}</label>
          <select v-model="form.category">
            <option value="赛事动态">{{ t('newsForm.categoryOptions.eventNews') }}</option>
            <option value="运动员专访">{{ t('newsForm.categoryOptions.athleteInterview') }}</option>
            <option value="精彩瞬间">{{ t('newsForm.categoryOptions.highlight') }}</option>
            <option value="其他">{{ t('newsForm.categoryOptions.other') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('newsForm.content') }}</label>
          <textarea v-model="form.content" rows="6" required></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('newsForm.date') }}</label>
          <input v-model="form.date" type="date" required />
        </div>
        <div class="form-group">
          <label>{{ t('newsForm.author') }}</label>
          <input v-model="form.author" />
        </div>
        <div class="form-group">
          <label>{{ t('newsForm.summary') }}</label>
          <textarea v-model="form.summary" rows="2" :placeholder="t('newsForm.summaryPlaceholder')"></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('newsForm.imageUrl') }}</label>
          <input v-model="form.imageUrl" :placeholder="t('newsForm.imageUrlPlaceholder')" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="close" class="cancel-btn">{{ t('newsForm.cancel') }}</button>
          <button type="submit" class="save-btn" :disabled="loading">{{ loading ? t('newsForm.saving') : t('newsForm.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  newsData: {
    type: Object,
    default: null
  },
  loading: Boolean
})

const emit = defineEmits(['update:visible', 'save'])

const isEditing = computed(() => !!props.newsData)

const defaultForm = {
  title: '',
  category: '赛事动态',
  content: '',
  date: new Date().toISOString().split('T')[0],
  author: '官方报道',
  summary: '',
  imageUrl: '',
  views: 0,
  comments: []
}

const form = reactive(JSON.parse(JSON.stringify(defaultForm)))

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.newsData) {
      const data = JSON.parse(JSON.stringify(props.newsData))
      Object.assign(form, data)
    } else {
      Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
    }
  }
})

const close = () => {
  emit('update:visible', false)
}

const handleSubmit = () => {
  // 如果没有摘要，自动生成
  if (!form.summary && form.content) {
    form.summary = form.content.substring(0, 100) + '...'
  }
  
  // 确保作者字段不为空
  if (!form.author) {
    form.author = '官方报道'
  }
  
  emit('save', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

form {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

input:focus, select:focus, textarea:focus {
  border-color: #4a90e2;
  outline: none;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  position: sticky;
  bottom: 0;
  background: white;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
</style>
