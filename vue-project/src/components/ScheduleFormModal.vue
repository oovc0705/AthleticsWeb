<template>
  <div v-if="visible" class="schedule-modal-overlay" @click.self="closeModal">
    <div class="schedule-modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? t('scheduleForm.editSchedule') : t('scheduleForm.addSchedule') }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="schedule-form">
        <div class="form-group">
          <label>{{ t('scheduleForm.eventId') }}</label>
          <input type="number" v-model="formData.event_id" required disabled class="form-input disabled-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('scheduleForm.eventName') }}</label>
          <input type="text" v-model="formData.event_name" required :placeholder="t('scheduleForm.eventNamePlaceholder')" class="form-input">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('scheduleForm.eventDate') }}</label>
            <input type="date" v-model="formData.event_date" required class="form-input">
          </div>
          
          <div class="form-group">
            <label>{{ t('scheduleForm.eventTime') }}</label>
            <input type="time" v-model="formData.event_time" class="form-input">
          </div>
        </div>
        
        <div class="form-group">
          <label>{{ t('scheduleForm.venue') }}</label>
          <input type="text" v-model="formData.venue" :placeholder="t('scheduleForm.venuePlaceholder')" class="form-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('scheduleForm.status') }}</label>
          <select v-model="formData.status" class="form-input">
            <!-- 中文选项 -->
            <template v-if="locale === 'zh-CN'">
              <option value="未开始">{{ t('scheduleForm.statusOptions.notStarted') }}</option>
              <option value="进行中">{{ t('scheduleForm.statusOptions.inProgress') }}</option>
              <option value="已结束">{{ t('scheduleForm.statusOptions.finished') }}</option>
            </template>
            <!-- 英文选项 -->
            <template v-else>
              <option value="Not Started">{{ t('scheduleForm.statusOptions.notStarted') }}</option>
              <option value="In Progress">{{ t('scheduleForm.statusOptions.inProgress') }}</option>
              <option value="Finished">{{ t('scheduleForm.statusOptions.finished') }}</option>
            </template>
          </select>
        </div>
        
        <div class="form-group">
          <label>{{ t('scheduleForm.description') }}</label>
          <textarea v-model="formData.description" :placeholder="t('scheduleForm.descriptionPlaceholder')" rows="3" class="form-textarea"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-secondary">{{ t('scheduleForm.cancel') }}</button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? t('scheduleForm.saving') : (isEdit ? t('scheduleForm.update') : t('scheduleForm.add')) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  scheduleData: {
    type: Object,
    default: () => ({})
  },
  eventId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['save', 'close', 'update:visible'])
const { t, locale } = useI18n()

const isEdit = ref(false)
const loading = ref(false)

// 初始状态映射
const getInitialStatus = () => {
  return locale.value === 'zh-CN' ? '未开始' : 'Not Started'
}

const formData = ref({
  event_id: props.eventId,
  event_name: '',
  event_date: '',
  event_time: '',
  venue: '',
  status: getInitialStatus(),
  description: ''
})

watch(() => props.scheduleData, (newData) => {
  if (newData && newData.id) {
    isEdit.value = true
    formData.value = {
      event_id: props.eventId,
      event_name: newData.event_name || '',
      event_date: newData.event_date ? newData.event_date.split('T')[0] : '',
      event_time: newData.event_time || '',
      venue: newData.venue || '',
      status: newData.status || getInitialStatus(),
      description: newData.description || ''
    }
  } else {
    isEdit.value = false
    formData.value = {
      event_id: props.eventId,
      event_name: '',
      event_date: '',
      event_time: '',
      venue: '',
      status: getInitialStatus(),
      description: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  try {
    emit('save', { ...formData.value })
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
  emit('update:visible', false)
}
</script>

<style scoped>
.schedule-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.schedule-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.schedule-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-input.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-blue);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
