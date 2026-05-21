<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? t('athleteForm.editAthlete') : t('athleteForm.addAthlete') }}</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ t('athleteForm.name') }}</label>
          <input v-model="form.name" required />
        </div>
        <div class="form-group">
          <label>{{ t('athleteForm.sport') }}</label>
          <input v-model="form.sport" required />
        </div>
        <div class="form-group">
          <label>{{ t('athleteForm.country') }}</label>
          <input v-model="form.country" />
        </div>
        <div class="form-row">
          <div class="form-group half">
            <label>{{ t('athleteForm.gender') }}</label>
            <select v-model="form.gender" required>
              <option value="">{{ t('athleteForm.select') }}</option>
              <option value="男">{{ t('athleteForm.genderOptions.male') }}</option>
              <option value="女">{{ t('athleteForm.genderOptions.female') }}</option>
            </select>
          </div>
          <div class="form-group half">
            <label>{{ t('athleteForm.environment') }}</label>
            <select v-model="form.environment" required>
              <option value="">{{ t('athleteForm.select') }}</option>
              <option value="室内">{{ t('athleteForm.environmentOptions.indoor') }}</option>
              <option value="室外">{{ t('athleteForm.environmentOptions.outdoor') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('athleteForm.birthday') }}</label>
          <input v-model="form.birthday" type="date" placeholder="YYYY-MM-DD" />
        </div>
        <div class="form-group">
          <label>{{ t('athleteForm.age') }}</label>
          <input :value="calculatedAge" disabled type="number" />
        </div>
        <div class="stats-group">
          <h4>{{ t('athleteForm.stats') }}</h4>
          <div class="form-row">
            <div class="form-group half">
              <label>{{ t('athleteForm.goldMedals') }}</label>
              <input v-model.number="form.stats.goldMedals" type="number" />
            </div>
            <div class="form-group half">
              <label>{{ t('athleteForm.silverMedals') }}</label>
              <input v-model.number="form.stats.silverMedals" type="number" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>{{ t('athleteForm.bronzeMedals') }}</label>
              <input v-model.number="form.stats.bronzeMedals" type="number" />
            </div>
            <div class="form-group half">
              <label>{{ t('athleteForm.worldRecords') }}</label>
              <input v-model.number="form.stats.worldRecords" type="number" />
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('athleteForm.personalBest') }}</label>
            <input v-model="form.stats.personalBest" />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('athleteForm.achievements') }}</label>
          <input v-model="achievementsInput" :placeholder="t('athleteForm.achievementsPlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ t('athleteForm.imageUrl') }}</label>
          <input v-model="form.image" :placeholder="t('athleteForm.imageUrlPlaceholder')" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="close" class="cancel-btn">{{ t('athleteForm.cancel') }}</button>
          <button type="submit" class="save-btn" :disabled="loading">{{ loading ? t('athleteForm.saving') : t('athleteForm.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  athleteData: {
    type: Object,
    default: null
  },
  loading: Boolean
})

const emit = defineEmits(['update:visible', 'save'])

const isEditing = computed(() => !!props.athleteData)
const achievementsInput = ref('')

const defaultForm = {
  name: '',
  sport: '',
  country: '',
  gender: '',
  environment: '',
  birthday: '', // 使用生日代替年龄
  stats: {
    goldMedals: 0,
    silverMedals: 0,
    bronzeMedals: 0,
    worldRecords: 0,
    personalBest: ''
  },
  achievements: [],
  image: ''
}

const form = reactive(JSON.parse(JSON.stringify(defaultForm)))

// 计算年龄
const calculatedAge = computed(() => {
  if (!form.birthday) return ''
  const birthDate = new Date(form.birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.athleteData) {
      // 编辑模式：填充数据
      const data = JSON.parse(JSON.stringify(props.athleteData))
      Object.assign(form, data)
      // 确保 stats 对象存在
      if (!form.stats) form.stats = { ...defaultForm.stats }
      // 处理成就数组转字符串
      achievementsInput.value = Array.isArray(form.achievements) ? form.achievements.join(', ') : ''
    } else {
      // 添加模式：重置表单
      Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
      achievementsInput.value = ''
    }
  }
})

const close = () => {
  emit('update:visible', false)
}

const handleSubmit = () => {
  // 处理成就输入
  form.achievements = achievementsInput.value
    .split(/[,，]/) // 支持中英文逗号
    .map(item => item.trim())
    .filter(item => item)

  // 确保数字类型
  form.stats.goldMedals = Number(form.stats.goldMedals) || 0
  form.stats.silverMedals = Number(form.stats.silverMedals) || 0
  form.stats.bronzeMedals = Number(form.stats.bronzeMedals) || 0
  form.stats.worldRecords = Number(form.stats.worldRecords) || 0
  
  // 添加计算出的年龄
  form.age = calculatedAge.value ? parseInt(calculatedAge.value) : null

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
  max-width: 600px;
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

.form-row {
  display: flex;
  gap: 15px;
}

.half {
  flex: 1;
}

.stats-group {
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.stats-group h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #555;
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
