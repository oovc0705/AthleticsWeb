/**
 * i18n初始化助手 - 确保在生产环境中正确加载语言包
 */

export function initializeI18n(i18n) {
  // 从localStorage获取保存的语言，如果没有则使用默认语言
  const savedLanguage = localStorage.getItem('language')
  const browserLanguage = navigator.language || navigator.userLanguage

  let initialLocale = 'zh-CN' // 默认语言

  // 优先使用保存的语言
  if (savedLanguage && i18n.global.locale.availableLocales?.includes(savedLanguage)) {
    initialLocale = savedLanguage
  }
  // 其次尝试使用浏览器语言
  else if (browserLanguage.startsWith('en')) {
    initialLocale = 'en-US'
  }

  // 设置i18n的locale
  i18n.global.locale.value = initialLocale

  // 验证i18n消息是否正确加载
  if (!i18n.global.getLocaleMessage(initialLocale)) {
    console.warn(
      `Language pack for ${initialLocale} not found, falling back to zh-CN`
    )
    i18n.global.locale.value = 'zh-CN'
  }

  // 监听locale变化，保存到localStorage
  if (i18n.global.locale) {
    const handleLocaleChange = (newLocale) => {
      localStorage.setItem('language', newLocale)
    }

    // Vue 3 Composition API中的watch已在i18n中处理
    // 这里只需确保selectLanguage在组件中调用时持久化
  }

  return i18n
}

/**
 * 获取当前有效的locale
 */
export function getCurrentLocale(i18n) {
  return i18n.global.locale.value || 'zh-CN'
}

/**
 * 检查语言包是否已加载
 */
export function isLocaleLoaded(i18n, locale) {
  return !!i18n.global.getLocaleMessage(locale)
}
