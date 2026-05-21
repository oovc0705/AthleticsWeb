<template>
  <div v-if="visible" class="result-modal-overlay" @click.self="closeModal">
    <div class="result-modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? t('resultForm.editResult') : t('resultForm.addResult') }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="result-form">
        <div class="form-group">
          <label>{{ t('resultForm.scheduleId') }}</label>
          <input type="number" v-model="formData.schedule_id" required disabled class="form-input disabled-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('resultForm.athleteName') }}</label>
          <input type="text" v-model="formData.athlete_name" required :placeholder="t('resultForm.athleteNamePlaceholder')" class="form-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('resultForm.country') }}</label>
          <input type="text" v-model="formData.country" :placeholder="t('resultForm.countryPlaceholder')" class="form-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('resultForm.rank') }}</label>
          <input type="number" v-model="formData.rank" required min="1" :placeholder="t('resultForm.rankPlaceholder')" class="form-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('resultForm.score') }}</label>
          <input type="text" v-model="formData.score" required :placeholder="t('resultForm.scorePlaceholder')" class="form-input">
        </div>
        
        <div class="form-group">
          <label>{{ t('resultForm.resultDetail') }}</label>
          <textarea v-model="formData.result_detail" :placeholder="t('resultForm.resultDetailPlaceholder')" rows="3" class="form-textarea"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-secondary">{{ t('resultForm.cancel') }}</button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? t('resultForm.saving') : (isEdit ? t('resultForm.update') : t('resultForm.add')) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  resultData: {
    type: Object,
    default: () => ({})
  },
  scheduleId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['save', 'close', 'update:visible'])

const isEdit = ref(false)
const loading = ref(false)
const formData = ref({
  schedule_id: props.scheduleId || 0,
  athlete_name: '',
  country: '',
  rank: 1,
  score: '',
  result_detail: ''
})

watch(() => props.resultData, (newData) => {
  if (newData && newData.id) {
    isEdit.value = true
    formData.value = {
      schedule_id: props.scheduleId || 0,
      athlete_name: newData.athlete_name || '',
      country: newData.country || '',
      rank: newData.rank || 1,
      score: newData.score || '',
      result_detail: newData.result_detail || ''
    }
  } else {
    isEdit.value = false
    formData.value = {
      schedule_id: props.scheduleId || 0,
      athlete_name: '',
      country: '',
      rank: 1,
      score: '',
      result_detail: ''
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
.result-modal-overlay {
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

.result-modal-content {
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

.result-form {
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
