import { reactive } from 'vue'

// 轻量级全局提示队列，由 AppToast 组件渲染
export const notifications = reactive([])

let nextId = 1

// 根据文案推测提示类型，调用方也可显式传入 type
const inferType = (message) => {
  if (/失败|错误|不能|请先|无效|异常|error|failed/i.test(message)) return 'error'
  if (/成功|已更新|已创建|已删除|已复制|已还原|saved|success/i.test(message)) return 'success'
  return 'info'
}

export const notify = (message, type, duration = 3000) => {
  const text = String(message ?? '')
  if (!text) return

  const id = nextId++
  notifications.push({
    id,
    message: text,
    type: type || inferType(text)
  })

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration)
  }
}

export const removeNotification = (id) => {
  const index = notifications.findIndex(item => item.id === id)
  if (index !== -1) {
    notifications.splice(index, 1)
  }
}
