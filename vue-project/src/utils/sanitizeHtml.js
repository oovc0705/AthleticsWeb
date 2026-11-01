// 渲染富文本前的安全清洗：移除脚本类标签、事件属性与危险协议链接
export function sanitizeHtml(html) {
  if (!html) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(String(html), 'text/html')

  const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form']
  doc.querySelectorAll(blockedTags.join(',')).forEach((el) => el.remove())

  doc.body.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim()

      if (name.startsWith('on') || name === 'srcdoc') {
        el.removeAttribute(attr.name)
        return
      }

      if (['href', 'src', 'xlink:href', 'action'].includes(name) && /^(javascript|vbscript|data):/i.test(value)) {
        el.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML
}
