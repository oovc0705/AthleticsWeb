// 简单的事件总线实现
class EventBus {
  constructor() {
    this.events = {}
  }

  // 监听事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 移除事件监听
  off(event, callback) {
    if (!this.events[event]) return
    
    const index = this.events[event].indexOf(callback)
    if (index > -1) {
      this.events[event].splice(index, 1)
    }
  }

  // 触发事件
  emit(event, data) {
    if (!this.events[event]) return
    
    this.events[event].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus()

// 定义常用事件类型
export const EVENTS = {
  EVENTS_UPDATED: 'events_updated',
  NEWS_UPDATED: 'news_updated', 
  ATHLETES_UPDATED: 'athletes_updated'
}