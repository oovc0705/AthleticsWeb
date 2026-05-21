<template>
  <div class="news-detail-view">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchArticle" class="btn btn-primary">重试</button>
    </div>
    <div v-else-if="!article" class="not-found">未找到该新闻</div>
    <div v-else>
      <!-- 新闻头部 -->
      <div class="news-header">
        <h1>{{ article.title }}</h1>
        <div class="category-badge" :class="getCategoryClass(article.category)">
          {{ article.category }}
        </div>
      </div>
      
      <!-- 新闻元信息 -->
      <div class="news-meta">
        <span class="author"><i class="icon-user"></i> {{ article.author }}</span>
        <span class="date"><i class="icon-calendar"></i> {{ formatDate(article.date) }}</span>
        <span class="read-time"><i class="icon-clock"></i> {{ getReadTime(article.content) }}</span>
        <span class="views"><i class="icon-eye"></i> {{ article.views || 0 }}</span>
        <FavoriteButton 
          v-if="!userStore.isAdmin" 
          :type="'news'" 
          :item-id="article.id"
          :show-label="true"
        />
      </div>
      
      <!-- 主图片 -->
      <div class="news-main-image" v-if="article.imageUrl">
        <img :src="article.imageUrl" :alt="article.title">
      </div>

      <!-- 新闻内容 -->
      <div class="news-content" v-html="article.content"></div>
      
      <!-- 图片画廊 -->
      <div class="image-gallery" v-if="article.images && article.images.length > 0">
        <h3>相关图片</h3>
        <div class="gallery-container">
          <div 
            class="gallery-item" 
            v-for="(image, index) in article.images" 
            :key="index"
            @click="openImageModal(image)"
          >
            <img :src="image.url" :alt="image.alt" loading="lazy">
          </div>
        </div>
      </div>
      
      <!-- 分享功能 -->
      <div class="news-share" v-if="!userStore.isAdmin">
        <span>分享: </span>
        <button @click="shareArticle('wechat')" class="share-btn wechat" title="分享到微信">
          <i class="icon-wechat"></i> 微信
        </button>
        <button @click="shareArticle('weibo')" class="share-btn weibo" title="分享到微博">
          <i class="icon-weibo"></i> 微博
        </button>
        <button @click="copyArticleLink" class="share-btn copy" title="复制链接">
          <i class="icon-copy"></i> 复制链接
        </button>
      </div>
      
      <!-- 评论功能 -->
      <div class="news-comments">
        <div class="comments-header">
          <h3>{{ totalCommentsCount }} 条评论</h3>
          
          <!-- 排序选项 -->
          <div class="sort-options">
            <button 
              v-for="option in sortOptions" 
              :key="option.value"
              :class="['sort-btn', { active: sortBy === option.value }]"
              @click="changeSortBy(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list" v-if="comments && comments.length > 0">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <div class="comment-header">
              <span class="comment-author">{{ comment.username }}</span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="comment-content">{{ formatCommentContent(comment.content) }}</div>
            <div class="comment-actions">
              <button v-if="!userStore.isAdmin" @click="handleLikeComment(comment.id)" class="action-btn like-btn" :class="{ active: comment.user_liked }">
                <i class="icon-like"></i>
                {{ comment.likes || 0 }}
              </button>
              <button v-if="!userStore.isAdmin" @click="handleDislikeComment(comment.id)" class="action-btn dislike-btn" :class="{ active: comment.user_disliked }">
                <i class="icon-dislike"></i>
              </button>
              <button v-if="!userStore.isAdmin" @click="showReplyInput(comment.id)" class="action-btn reply-btn">
                <i class="icon-reply"></i>
                回复
              </button>
              <button v-if="userStore.isAdmin" @click="deleteComment(comment.id)" class="action-btn delete-btn">
                删除
              </button>
            </div>
            
            <!-- 回复输入框 -->
            <div v-if="replyingTo === comment.id" class="reply-input-container">
              <div class="reply-input-wrapper">
                <textarea 
                  :placeholder="`回复 @${comment.username}：`" 
                  v-model="replyContent" 
                  rows="3" 
                  class="reply-input"
                  ref="replyInput"
                ></textarea>
                <div class="reply-actions-bar">
                  <button @click="toggleReplyEmojiPicker()" class="emoji-toggle-btn" title="添加表情">
                    <span>😊</span>
                  </button>
                </div>
              </div>
              
              <!-- 回复表情选择器 -->
              <div v-if="showReplyEmojiPicker && replyingTo === comment.id" class="emoji-picker">
                <div class="emoji-tabs">
                  <button 
                    v-for="tab in emojiTabs" 
                    :key="tab.id"
                    :class="['emoji-tab', { active: activeEmojiTab === tab.id }]"
                    @click="activeEmojiTab = tab.id"
                  >
                    {{ tab.label }}
                  </button>
                </div>
                
                <div class="emoji-content">
                  <div v-if="activeEmojiTab === 'emoji'" class="emoji-grid">
                    <span 
                      v-for="emoji in emojis" 
                      :key="emoji"
                      class="emoji-item"
                      @click="insertReplyEmoji(emoji)"
                    >
                      {{ emoji }}
                    </span>
                  </div>
                  
                  <div v-else class="kaomoji-grid">
                    <span 
                      v-for="kaomoji in kaomojis" 
                      :key="kaomoji"
                      class="kaomoji-item"
                      @click="insertReplyEmoji(kaomoji)"
                      :title="kaomoji"
                    >
                      {{ kaomoji }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="reply-actions">
                <button @click="cancelReply" class="cancel-btn">取消</button>
                <button @click="submitReply(comment.id, comment.username)" class="submit-reply-btn" :disabled="submittingReply">
                  {{ submittingReply ? '回复中...' : '回复' }}
                </button>
              </div>
            </div>
            
            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
              <button @click="toggleReplies(comment.id)" class="toggle-replies-btn">
                <span v-if="!expandedReplies.includes(comment.id)">
                  <i class="icon-expand"></i> 展开 {{ comment.replies.length }} 条回复
                </span>
                <span v-else>
                  <i class="icon-collapse"></i> 收起回复
                </span>
              </button>
              
              <div v-show="expandedReplies.includes(comment.id)" class="replies-list">
                <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
                  <div class="reply-header">
                    <span class="reply-author">{{ reply.username }}</span>
                    <span class="reply-date">{{ formatDate(reply.created_at) }}</span>
                  </div>
                  <div v-if="reply.reply_to_username" class="reply-to">
                    回复 @{{ reply.reply_to_username }}：
                  </div>
                  <div class="reply-content">{{ formatCommentContent(reply.content) }}</div>
                  <div class="reply-actions">
                    <button v-if="!userStore.isAdmin" @click="handleLikeComment(reply.id)" class="action-btn like-btn" :class="{ active: reply.user_liked }">
                      <i class="icon-like"></i>
                      {{ reply.likes || 0 }}
                    </button>
                    <button v-if="!userStore.isAdmin" @click="handleDislikeComment(reply.id)" class="action-btn dislike-btn" :class="{ active: reply.user_disliked }">
                      <i class="icon-dislike"></i>
                    </button>
                    <button v-if="!userStore.isAdmin" @click="showReplyInput(comment.id, reply.username)" class="action-btn reply-btn">
                      <i class="icon-reply"></i>
                      回复
                    </button>
                    <button v-if="userStore.isAdmin" @click="deleteComment(reply.id)" class="action-btn delete-btn">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 添加评论 -->
        <div class="add-comment" v-if="userStore.isLoggedIn && !userStore.isAdmin">
          <div class="comment-input-wrapper">
            <textarea 
              placeholder="写下您的评论..." 
              v-model="newComment.content" 
              rows="3" 
              class="comment-content-input"
              ref="commentInput"
            ></textarea>
            <div class="comment-actions-bar">
              <button @click="toggleEmojiPicker" class="emoji-toggle-btn" title="添加表情">
                <span>😊</span>
              </button>
              <button @click="addComment" class="submit-comment-btn" :disabled="submittingComment">
                {{ submittingComment ? '发布中...' : '发布' }}
              </button>
            </div>
          </div>
          
          <!-- 表情选择器 -->
          <div v-if="showEmojiPicker" class="emoji-picker">
            <div class="emoji-tabs">
              <button 
                v-for="tab in emojiTabs" 
                :key="tab.id"
                :class="['emoji-tab', { active: activeEmojiTab === tab.id }]"
                @click="activeEmojiTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
            
            <div class="emoji-content">
              <!-- Emoji表情 -->
              <div v-if="activeEmojiTab === 'emoji'" class="emoji-grid">
                <span 
                  v-for="emoji in emojis" 
                  :key="emoji"
                  class="emoji-item"
                  @click="insertEmoji(emoji)"
                >
                  {{ emoji }}
                </span>
              </div>
              
              <!-- 颜文字 -->
              <div v-else class="kaomoji-grid">
                <span 
                  v-for="kaomoji in kaomojis" 
                  :key="kaomoji"
                  class="kaomoji-item"
                  @click="insertEmoji(kaomoji)"
                  :title="kaomoji"
                >
                  {{ kaomoji }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="!userStore.isLoggedIn" class="login-prompt">
          <p>请先登录后发表评论</p>
          <button @click="showLoginModal = true" class="login-btn">登录</button>
        </div>
      </div>
      
      <!-- 返回按钮 -->
      <div class="back-container">
        <button @click="goBack" class="back-btn">返回新闻列表</button>
      </div>
    </div>
    
    <!-- 图片模态框 -->
    <div v-if="showImageModal" class="image-modal" @click.self="closeImageModal">
      <div class="modal-content">
        <span class="close" @click="closeImageModal">&times;</span>
        <img :src="currentImage.url" :alt="currentImage.alt">
        <p v-if="currentImage.caption">{{ currentImage.caption }}</p>
      </div>
    </div>
    
    <!-- 登录模态框 -->
    <LoginModal v-model:visible="showLoginModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNewsById } from '@/services/newsService'
import api from '@/services/apiService'
import { useUserStore } from '@/stores/user'
import LoginModal from '@/components/LoginModal.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式状态
const loading = ref(true)
const error = ref(null)
const article = ref(null)
const showImageModal = ref(false)
const currentImage = ref({ url: '', alt: '', caption: '' })
const submittingComment = ref(false)
const showEmojiPicker = ref(false)
const activeEmojiTab = ref('emoji')
const commentInput = ref(null)
const showLoginModal = ref(false)

// 评论相关
const newComment = ref({ content: '' })
const comments = ref([])
const sortBy = ref('comprehensive')
const expandedReplies = ref([])
const replyingTo = ref(null)
const replyContent = ref('')
const submittingReply = ref(false)
const showReplyEmojiPicker = ref(false)
const replyInput = ref(null)

// 排序选项
const sortOptions = [
  { label: '综合排序', value: 'comprehensive' },
  { label: '最新', value: 'latest' },
  { label: '最热', value: 'hottest' }
]

// 表情数据
const emojiTabs = [
  { id: 'emoji', label: 'Emoji' },
  { id: 'kaomoji', label: '颜文字' }
]

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
  '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎',
  '👏', '🙌', '🤝', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜'
]

const kaomojis = [
  '(^o^)', '(≧∇≦)', '(≧ω≦)', '(oﾟvﾟ)ノ', '(^▽^)', '(^_^)v',
  '(T_T)', '(ToT)', '(>_<)', '(>_<)', '(>_<)', '(;´༎ຶД༎ຶ`)',
  '(｡•́︿•̀｡)', '(｡•́︿•̀｡)', '(｡•́︿•̀｡)', '(｡•́︿•̀｡)', '(｡•́︿•̀｡)',
  '(￣▽￣)', '(￣ω￣)', '(￣_￣)', '(￣ー￣)', '(￣へ￣)',
  '(*^▽^*)', '(*^▽^*)', '(*^▽^*)', '(*^▽^*)', '(*^▽^*)',
  '(づ｡◕‿‿◕｡)づ', '(づ￣ 3￣)づ', '(づ｡◕‿‿◕｡)づ',
  '(ง •_•)ง', '(ง •_•)ง', '(ง •_•)ง', '(ง •_•)ง',
  '( ˘ ³˘)♥', '( ˘ ³˘)♥', '( ˘ ³˘)♥', '( ˘ ³˘)♥',
  '(✿◡‿◡)', '(✿◡‿◡)', '(✿◡‿◡)', '(✿◡‿◡)',
  'ヾ(≧▽≦*)o', 'ヾ(≧▽≦*)o', 'ヾ(≧▽≦*)o', 'ヾ(≧▽≦*)o',
  '(๑•̀ㅂ•́)و✧', '(๑•̀ㅂ•́)و✧', '(๑•̀ㅂ•́)و✧', '(๑•̀ㅂ•́)و✧',
  'φ(゜▽゜*)♪', 'φ(゜▽゜*)♪', 'φ(゜▽゜*)♪', 'φ(゜▽゜*)♪',
  '( •̀ ω •́ )✧', '( •̀ ω •́ )✧', '( •̀ ω •́ )✧', '( •̀ ω •́ )✧',
  'ε=ε=ε=(~￣▽￣)~', 'ε=ε=ε=(~￣▽￣)~', 'ε=ε=ε=(~￣▽￣)~',
  '( •̀ ω •́ )y', '( •̀ ω •́ )y', '( •̀ ω •́ )y', '( •̀ ω •́ )y',
  'o(*￣▽￣*)ブ', 'o(*￣▽￣*)ブ', 'o(*￣▽￣*)ブ', 'o(*￣▽￣*)ブ'
]

// 从路由参数获取新闻ID
const newsId = computed(() => route.params.id)

// 计算总评论数
const totalCommentsCount = computed(() => {
  let count = comments.value.length
  comments.value.forEach(comment => {
    if (comment.replies) {
      count += comment.replies.length
    }
  })
  return count
})

// 格式化评论内容以确保正确显示
const formatCommentContent = (content) => {
  if (!content) return ''
  // 确保内容被正确处理，移除可能的问题字符但保留正常文本和表情符号
  const nullChar = String.fromCharCode(0)
  const replacementChar = String.fromCharCode(65533)
  return String(content)
    .replace(new RegExp(nullChar, 'g'), '') // 移除空字符
    .replace(new RegExp(replacementChar, 'g'), '') // 移除替换字符
    .trim()
}

// 获取新闻详情
const fetchArticle = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await getNewsById(newsId.value)
    article.value = data
    await fetchComments()
  } catch (err) {
    console.error('获取新闻详情失败:', err)
    error.value = '获取新闻详情失败'
  } finally {
    loading.value = false
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const response = await api.get(`/news/${newsId.value}/comments?sort=${sortBy.value}`)
    comments.value = response.data
  } catch (err) {
    console.error('获取评论失败:', err)
  }
}

// 切换排序方式
const changeSortBy = async (value) => {
  sortBy.value = value
  await fetchComments()
}

// 辅助函数
const getCategoryClass = (category) => {
  return category ? category.toLowerCase().replace(/\s+/g, '-') : ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getReadTime = (content) => {
  if (!content) return '1 分钟阅读'
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} 分钟阅读`
}

// 评论功能
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji) => {
  if (commentInput.value) {
    const textarea = commentInput.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = newComment.value.content
    
    newComment.value.content = text.substring(0, start) + emoji + text.substring(end)
    
    textarea.focus()
    textarea.setSelectionRange(start + emoji.length, start + emoji.length)
  } else {
    newComment.value.content += emoji
  }
}

const addComment = async () => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  if (!newComment.value.content || newComment.value.content.trim() === '') {
    alert('请输入评论内容')
    return
  }
  
  submittingComment.value = true
  
  try {
    const response = await api.post(`/news/${newsId.value}/comments`, {
      content: newComment.value.content
    })
    
    comments.value.unshift({
      ...response.data,
      replies: [],
      user_liked: false,
      user_disliked: false
    })
    
    newComment.value.content = ''
  } catch (err) {
    console.error('发布评论失败:', err)
    alert('发布评论失败')
  } finally {
    submittingComment.value = false
  }
}

// 点赞评论
const handleLikeComment = async (commentId) => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  try {
    const response = await api.put(`/news/comments/${commentId}/like`)
    
    const updateComment = (commentList) => {
      for (let comment of commentList) {
        if (comment.id === commentId) {
          comment.likes = response.data.likes
          comment.dislikes = response.data.dislikes
          comment.user_liked = response.data.liked
          comment.user_disliked = response.data.disliked
          return
        }
        if (comment.replies) {
          updateComment(comment.replies)
        }
      }
    }
    
    updateComment(comments.value)
  } catch (err) {
    console.error('点赞失败:', err)
    alert('点赞失败')
  }
}

// 点踩评论
const handleDislikeComment = async (commentId) => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  try {
    const response = await api.put(`/news/comments/${commentId}/dislike`)
    
    const updateComment = (commentList) => {
      for (let comment of commentList) {
        if (comment.id === commentId) {
          comment.likes = response.data.likes
          comment.dislikes = response.data.dislikes
          comment.user_liked = response.data.liked
          comment.user_disliked = response.data.disliked
          return
        }
        if (comment.replies) {
          updateComment(comment.replies)
        }
      }
    }
    
    updateComment(comments.value)
  } catch (err) {
    console.error('点踩失败:', err)
    alert('点踩失败')
  }
}

// 显示回复输入框
const showReplyInput = (commentId, replyToUsername = null) => {
  replyingTo.value = commentId
  replyContent.value = replyToUsername ? `@${replyToUsername} ` : ''
  showReplyEmojiPicker.value = false
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
  showReplyEmojiPicker.value = false
}

// 提交回复
const submitReply = async (parentId, replyToUsername) => {
  if (!replyContent.value || replyContent.value.trim() === '') {
    alert('请输入回复内容')
    return
  }
  
  submittingReply.value = true
  
  try {
    let content = replyContent.value
    
    if (replyToUsername) {
      const mentionPrefix = `@${replyToUsername} `
      if (content.startsWith(mentionPrefix)) {
        content = content.substring(mentionPrefix.length)
      }
    }
    
    const response = await api.post(`/news/${newsId.value}/comments`, {
      content: content,
      parent_id: parentId,
      reply_to_username: replyToUsername
    })
    
    const parentComment = comments.value.find(c => c.id === parentId)
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = []
      }
      parentComment.replies.push({
        ...response.data,
        user_liked: false,
        user_disliked: false
      })
    }
    
    cancelReply()
  } catch (err) {
    console.error('回复失败:', err)
    alert('回复失败')
  } finally {
    submittingReply.value = false
  }
}

// 切换回复表情选择器
const toggleReplyEmojiPicker = () => {
  showReplyEmojiPicker.value = !showReplyEmojiPicker.value
}

// 插入回复表情
const insertReplyEmoji = (emoji) => {
  if (replyInput.value) {
    const textarea = replyInput.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = replyContent.value
    
    replyContent.value = text.substring(0, start) + emoji + text.substring(end)
    
    textarea.focus()
    textarea.setSelectionRange(start + emoji.length, start + emoji.length)
  } else {
    replyContent.value += emoji
  }
}

// 展开/收起回复
const toggleReplies = (commentId) => {
  const index = expandedReplies.value.indexOf(commentId)
  if (index > -1) {
    expandedReplies.value.splice(index, 1)
  } else {
    expandedReplies.value.push(commentId)
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    await api.delete(`/news/comments/${commentId}`)
    
    const removeComment = (commentList) => {
      const index = commentList.findIndex(c => c.id === commentId)
      if (index > -1) {
        commentList.splice(index, 1)
        return true
      }
      for (let comment of commentList) {
        if (comment.replies) {
          if (removeComment(comment.replies)) {
            return true
          }
        }
      }
      return false
    }
    
    removeComment(comments.value)
  } catch (err) {
    console.error('删除评论失败:', err)
    alert('删除评论失败')
  }
}

// 分享功能
const shareArticle = (platform) => {
  const shareUrl = window.location.href
  const title = article.value.title
  
  switch (platform) {
    case 'wechat':
      alert('微信分享功能需要在微信客户端打开')
      break
    case 'weibo': {
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
      window.open(weiboUrl, '_blank')
      break
    }
    default:
      break
  }
}

const copyArticleLink = () => {
  const link = window.location.href
  navigator.clipboard.writeText(link).then(() => {
    alert('链接已复制到剪贴板')
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

// 图片模态框方法
const openImageModal = (image) => {
  currentImage.value = image
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
}

// 返回新闻列表
const goBack = () => {
  router.push('/news')
}

// 生命周期钩子
onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
/* 页面容器 */
.news-detail-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 新闻头部 */
.news-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-red);
}

.news-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--dark-gray);
  line-height: 1.3;
}

/* 分类标签 */
.category-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
}

.category-badge.赛事动态 {
  background-color: var(--primary-red);
}

.category-badge.运动员专访 {
  background-color: #1890ff;
}

.category-badge.精彩瞬间 {
  background-color: #52c41a;
}

/* 新闻元信息 */
.news-meta {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.news-meta .favorite-button {
  margin-left: auto;
}

.news-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 新闻内容 */
.news-content {
  line-height: 1.8;
  margin-bottom: 30px;
  color: var(--dark-gray);
}

/* 图片画廊 */
.image-gallery {
  margin: 30px 0;
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.gallery-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.gallery-item {
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.gallery-item:hover {
  transform: scale(1.03);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

/* 分享功能 */
.news-share {
  margin: 30px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.news-share span {
  font-weight: bold;
  color: var(--dark-gray);
}

.share-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.share-btn.wechat {
  background-color: #07c160;
}

.share-btn.weibo {
  background-color: #e6162d;
}

.share-btn.copy {
  background-color: #666;
}

.share-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 评论功能 */
.news-comments {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #eee;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.comments-header h3 {
  margin: 0;
  color: var(--dark-gray);
  font-size: 1.5rem;
}

.sort-options {
  display: flex;
  gap: 10px;
}

.sort-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s;
}

.sort-btn:hover {
  border-color: var(--primary-red);
  color: var(--primary-red);
}

.sort-btn.active {
  background: var(--primary-red);
  color: white;
  border-color: var(--primary-red);
}

.comments-list {
  margin-bottom: 35px;
}

.comment-item {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  font-weight: bold;
  color: var(--dark-gray);
}

.comment-date {
  color: #999;
  font-size: 0.85rem;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.5;
  color: var(--dark-gray);
}

.comment-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.action-btn:hover {
  color: var(--primary-red);
}

.action-btn.like-btn.active {
  color: var(--primary-red);
  font-weight: bold;
}

.action-btn.like-btn::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 3px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.action-btn.like-btn.active::before {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-red)" stroke="var(--primary-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>');
}

.action-btn.dislike-btn::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 3px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM7 2h10v7"></path></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.action-btn.dislike-btn.active {
  color: var(--primary-red);
  font-weight: bold;
}

.action-btn.dislike-btn.active::before {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-red)" stroke="var(--primary-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM7 2h10v7"></path></svg>');
}

.action-btn.delete-btn {
  color: #ff4d4f;
}

.action-btn.delete-btn:hover {
  background: #fff1f0;
  border-radius: 4px;
}

/* 回复输入框 */
.reply-input-container {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.reply-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.reply-actions-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.submit-reply-btn {
  padding: 8px 16px;
  background: var(--primary-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-reply-btn:hover {
  background: var(--dark-red);
}

.submit-reply-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 回复列表 */
.replies-container {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid #eee;
}

.toggle-replies-btn {
  background: none;
  border: none;
  color: var(--primary-red);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.toggle-replies-btn:hover {
  text-decoration: underline;
}

.replies-list {
  margin-top: 15px;
}

.reply-item {
  margin-bottom: 15px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #eee;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-author {
  font-weight: bold;
  color: var(--dark-gray);
  font-size: 0.95rem;
}

.reply-date {
  color: #999;
  font-size: 0.8rem;
}

.reply-to {
  color: var(--primary-red);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.reply-content {
  margin-bottom: 8px;
  line-height: 1.5;
  color: var(--dark-gray);
  font-size: 0.95rem;
}

.reply-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 添加评论 */
.add-comment {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-content-input {
  flex: 1;
  padding: 12px 60px 12px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.comment-actions-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.emoji-toggle-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.emoji-toggle-btn:hover {
  background: #f0f0f0;
  border-color: var(--primary-red);
}

.emoji-picker {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.emoji-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  background: #f9f9f9;
}

.emoji-tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.emoji-tab:hover {
  background: #f0f0f0;
}

.emoji-tab.active {
  color: var(--primary-red);
  border-bottom-color: var(--primary-red);
  background: white;
}

.emoji-content {
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 1.5rem;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}

.emoji-item:hover {
  background: #f0f0f0;
  transform: scale(1.2);
}

.kaomoji-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.kaomoji-item {
  font-size: 1rem;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kaomoji-item:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.submit-comment-btn {
  padding: 8px 16px;
  background: var(--primary-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
}

.submit-comment-btn:hover {
  background: var(--dark-red);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.submit-comment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-prompt {
  text-align: center;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
}

.login-prompt p {
  color: #666;
  margin-bottom: 15px;
}

.login-btn {
  display: inline-block;
  padding: 10px 24px;
  background: var(--primary-red);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.login-btn:hover {
  background: var(--dark-red);
  transform: translateY(-2px);
}

/* 返回按钮 */
.back-container {
  margin-top: 40px;
  text-align: center;
}

.back-btn {
  padding: 12px 24px;
  background: var(--primary-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background: var(--dark-red);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

/* 图片模态框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.image-modal .modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.image-modal .close {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.image-modal .close:hover {
  transform: rotate(90deg);
}

.image-modal img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.image-modal p {
  color: white;
  text-align: center;
  margin-top: 10px;
}

/* 加载和错误状态 */
.loading-container,
.error-container,
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: var(--primary-color);
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .news-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .sort-options {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .sort-btn {
    flex: 1;
    min-width: 80px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .kaomoji-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
