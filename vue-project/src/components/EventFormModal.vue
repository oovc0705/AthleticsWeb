<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? t('eventForm.editEvent') : t('eventForm.addEvent') }}</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ t('eventForm.name') }}</label>
          <input v-model="form.name" required />
        </div>
        <div class="form-group">
          <label>{{ t('eventForm.location') }}</label>
          <input v-model="form.location" required />
        </div>
        <div class="form-row">
          <div class="form-group half">
            <label>{{ t('eventForm.startDate') }}</label>
            <input v-model="form.date" type="date" required />
          </div>
          <div class="form-group half">
            <label>{{ t('eventForm.endDate') }}</label>
            <input v-model="form.endDate" type="date" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group half">
            <label>{{ t('eventForm.type') }}</label>
            <input v-model="form.type" :placeholder="t('eventForm.typePlaceholder')" />
          </div>
          <div class="form-group half">
            <label>{{ t('eventForm.status') }}</label>
            <select v-model="form.status">
              <option :value="t('eventForm.statusOptions.completed')">{{ t('eventForm.statusOptions.completed') }}</option>
              <option :value="t('eventForm.statusOptions.ongoing')">{{ t('eventForm.statusOptions.ongoing') }}</option>
              <option :value="t('eventForm.statusOptions.planned')">{{ t('eventForm.statusOptions.planned') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('eventForm.level') }}</label>
          <select v-model="form.level">
            <option value="">{{ t('eventForm.levelPlaceholder') }}</option>
            <option value="OG/WA">{{ t('eventForm.levelOptions.highest') }}</option>
            <option value="DF">{{ t('eventForm.levelOptions.df') }}</option>
            <option value="DL">{{ t('eventForm.levelOptions.dl') }}</option>
            <option value="A">{{ t('eventForm.levelOptions.a') }}</option>
            <option value="B">{{ t('eventForm.levelOptions.b') }}</option>
            <option value="C">{{ t('eventForm.levelOptions.c') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('eventForm.organizer') }}</label>
          <input v-model="form.organizer" />
        </div>
        <div class="form-group">
          <label>{{ t('eventForm.description') }}</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('eventForm.imageUrl') }}</label>
          <input v-model="form.imageUrl" :placeholder="t('eventForm.imageUrlPlaceholder')" />
        </div>
        
        <!-- 赛事时间表管理 -->
        <div class="form-group">
          <label>{{ t('eventForm.schedules') }}</label>
          <div class="schedule-management">
            <div v-for="(schedule, index) in form.schedules" :key="index" class="schedule-item">
              <div class="schedule-header">
                <h4>{{ t('eventForm.scheduleItem', { index: index + 1 }) }}</h4>
                <button @click="removeSchedule(index)" class="remove-schedule-btn">{{ t('eventForm.removeSchedule') }}</button>
              </div>
              <div class="schedule-form">
                <div class="form-row">
                  <div class="form-group half">
                    <label>{{ t('eventForm.eventName') }}</label>
                    <input v-model="schedule.event_name" :placeholder="t('eventForm.eventNamePlaceholder')" required />
                  </div>
                  <div class="form-group half">
                    <label>{{ t('eventForm.eventDate') }}</label>
                    <input v-model="schedule.event_date" type="date" required />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group half">
                    <label>{{ t('eventForm.eventTime') }}</label>
                    <input v-model="schedule.event_time" type="time" />
                  </div>
                  <div class="form-group half">
                    <label>{{ t('eventForm.venue') }}</label>
                    <input v-model="schedule.venue" :placeholder="t('eventForm.venuePlaceholder')" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>{{ t('eventForm.scheduleStatus') }}</label>
                    <select v-model="schedule.status">
                      <option :value="t('eventForm.scheduleStatusOptions.notStarted')">{{ t('eventForm.scheduleStatusOptions.notStarted') }}</option>
                      <option :value="t('eventForm.scheduleStatusOptions.inProgress')">{{ t('eventForm.scheduleStatusOptions.inProgress') }}</option>
                      <option :value="t('eventForm.scheduleStatusOptions.finished')">{{ t('eventForm.scheduleStatusOptions.finished') }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button @click="addSchedule" type="button" class="add-schedule-btn">
              <span class="icon">+</span> {{ t('eventForm.addSchedule') }}
            </button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="close" class="cancel-btn">{{ t('eventForm.cancel') }}</button>
          <button type="submit" class="save-btn" :disabled="loading">{{ loading ? t('eventForm.saving') : t('eventForm.save') }}</button>
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
  eventData: {
    type: Object,
    default: null
  },
  loading: Boolean
})

const emit = defineEmits(['update:visible', 'save'])

const isEditing = computed(() => !!props.eventData)

const defaultForm = {
  name: '',
  location: '',
  date: '',
  endDate: '',
  type: t('eventForm.typePlaceholder'),
  status: '计划中',
  level: '',
  description: '',
  organizer: 'World Athletics',
  imageUrl: '',
  schedules: []
}

const form = reactive(JSON.parse(JSON.stringify(defaultForm)))

// 计算赛事状态的函数
const calculateStatus = () => {
  if (!form.date) return
  
  const now = new Date()
  const startDate = new Date(form.date)
  const endDate = form.endDate ? new Date(form.endDate) : startDate
  
  if (now > endDate) {
    form.status = t('eventForm.statusOptions.completed')
  } else if (now >= startDate) {
    form.status = t('eventForm.statusOptions.ongoing')
  } else {
    form.status = t('eventForm.statusOptions.planned')
  }
}

// 监听日期变化，自动更新状态
watch(() => [form.date, form.endDate], () => {
  calculateStatus()
}, { deep: true })

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.eventData) {
      const data = JSON.parse(JSON.stringify(props.eventData))
      Object.assign(form, data)
      // 确保日期格式正确
      if (form.date && typeof form.date === 'string') {
        form.date = form.date.split('T')[0] // 移除时间部分，只保留日期
      }
      if (form.endDate && typeof form.endDate === 'string') {
        form.endDate = form.endDate.split('T')[0]
      }
      // 确保level和schedules字段有默认值
      if (form.level === null || form.level === undefined) {
        form.level = ''
      }
      if (!form.schedules || !Array.isArray(form.schedules)) {
        form.schedules = []
      } else {
        // 处理每个时间表项目的日期和时间格式
        form.schedules.forEach(schedule => {
          // 确保日期格式正确，只保留日期部分
          if (schedule.event_date && typeof schedule.event_date === 'string' && schedule.event_date.includes('T')) {
            schedule.event_date = schedule.event_date.split('T')[0]
          }
          // 确保时间字段格式正确，只保留HH:MM部分
          if (schedule.event_time && typeof schedule.event_time === 'string') {
            // 移除秒数部分，只保留HH:MM格式
            schedule.event_time = schedule.event_time.substring(0, 5)
          } else if (!schedule.event_time) {
            schedule.event_time = ''
          }
        })
      }
    } else {
      Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
    }
  }
})

const close = () => {
  emit('update:visible', false)
}

// 添加新的时间表条目
const addSchedule = () => {
  form.schedules.push({
    event_name: '',
    event_date: '',
    event_time: '',
    venue: '',
    status: t('eventForm.scheduleStatusOptions.notStarted')
  })
}

// 删除时间表条目
const removeSchedule = (index) => {
  if (form.schedules.length > 0) {
    form.schedules.splice(index, 1)
  }
}

const handleSubmit = () => {
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

/* 时间表管理样式 */
.schedule-management {
  margin-top: 10px;
}

.schedule-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.schedule-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.remove-schedule-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8rem;
}

.schedule-form {
  margin-top: 10px;
}

.add-schedule-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
}

.add-schedule-btn:hover {
  background-color: #218838;
}
</style>
