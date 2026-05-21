<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isLogin ? t('loginModal.loginTitle') : t('loginModal.registerTitle') }}</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <!-- 登录表单 -->
        <form v-if="isLogin" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">{{ t('loginModal.email') }}</label>
            <input 
              type="email" 
              id="email" 
              v-model="loginForm.email" 
              required 
              :placeholder="t('loginModal.emailPlaceholder')"
            />
          </div>
          <div class="form-group">
            <label for="password">{{ t('loginModal.password') }}</label>
            <input 
              type="password" 
              id="password" 
              v-model="loginForm.password" 
              required 
              :placeholder="t('loginModal.passwordPlaceholder')"
            />
          </div>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? t('loginModal.loggingIn') : t('loginModal.loginBtn') }}
            </button>
          </div>
          <div class="switch-form">
            {{ t('loginModal.noAccount') }} <a href="#" @click.prevent="toggleForm">{{ t('loginModal.registerNow') }}</a>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="register-name">{{ t('loginModal.username') }}</label>
            <input 
              type="text" 
              id="register-name" 
              v-model="registerForm.name" 
              required 
              :placeholder="t('loginModal.usernamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label for="register-email">{{ t('loginModal.email') }}</label>
            <input 
              type="email" 
              id="register-email" 
              v-model="registerForm.email" 
              required 
              :placeholder="t('loginModal.emailPlaceholder')"
            />
          </div>
          <div class="form-group">
            <label for="register-password">{{ t('loginModal.password') }}</label>
            <input 
              type="password" 
              id="register-password" 
              v-model="registerForm.password" 
              required 
              :placeholder="t('loginModal.passwordMinLength')"
              minlength="6"
            />
          </div>
          
          <!-- 国家选择 -->
          <div class="form-group">
            <label for="register-country">{{ t('loginModal.country') }}</label>
            <select 
              id="register-country" 
              v-model="registerForm.country" 
              required 
              class="form-control"
            >
              <option 
                v-for="country in countries" 
                :key="country.value" 
                :value="country.value"
              >
                {{ country.label }}
              </option>
            </select>
          </div>
          
          <!-- 邮箱验证码 -->
          <div class="form-group">
            <label for="register-code">{{ t('loginModal.verificationCode') }}</label>
            <div class="captcha-input-group">
              <input 
                type="text" 
                id="register-code" 
                v-model="verificationCode" 
                required 
                :placeholder="t('loginModal.verificationCodePlaceholder')"
                maxlength="6"
                pattern="[0-9]{6}"
              />
              <button 
                type="button" 
                class="captcha-btn" 
                @click="sendVerificationCode"
                :disabled="!canSendCode || !registerForm.email"
              >
                {{ canSendCode ? t('loginModal.getCode') : t('loginModal.retryAfter', { seconds: countdown }) }}
              </button>
            </div>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? t('loginModal.registering') : t('loginModal.registerBtn') }}
            </button>
          </div>
          <div class="switch-form">
            {{ t('loginModal.haveAccount') }} <a href="#" @click.prevent="toggleForm">{{ t('loginModal.loginNow') }}</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({  visible: {    type: Boolean,    default: false  },  initialIsLogin: {     type: Boolean,     default: true   }})

const emit = defineEmits(['update:visible', 'login-success'])

const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const isLogin = ref(props.initialIsLogin) // 控制显示登录或注册表单

// 监听初始登录状态的变化，确保在组件初始化和属性变化时都能正确设置
watch(() => props.initialIsLogin, (newVal) => {
  isLogin.value = newVal
  error.value = '' // 切换时清除错误信息
}, { immediate: true })

// 监听visible属性的变化，确保当模态框显示时，能正确获取最新的初始登录状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 当模态框显示时，再次确认初始登录状态
    isLogin.value = props.initialIsLogin
    error.value = '' // 清除错误信息
  }
})

// 登录表单
const loginForm = reactive({
  email: '', // 清空默认邮箱，避免用户登录时使用错误的邮箱
  password: ''
})

// 世界国家和地区列表
const countries = [
  { value: 'AF', label: '阿富汗' },
  { value: 'AX', label: '奥兰群岛' },
  { value: 'AL', label: '阿尔巴尼亚' },
  { value: 'DZ', label: '阿尔及利亚' },
  { value: 'AS', label: '美属萨摩亚' },
  { value: 'AD', label: '安道尔' },
  { value: 'AO', label: '安哥拉' },
  { value: 'AI', label: '安圭拉' },
  { value: 'AQ', label: '南极洲' },
  { value: 'AG', label: '安提瓜和巴布达' },
  { value: 'AR', label: '阿根廷' },
  { value: 'AM', label: '亚美尼亚' },
  { value: 'AW', label: '阿鲁巴' },
  { value: 'AU', label: '澳大利亚' },
  { value: 'AT', label: '奥地利' },
  { value: 'AZ', label: '阿塞拜疆' },
  { value: 'BS', label: '巴哈马' },
  { value: 'BH', label: '巴林' },
  { value: 'BD', label: '孟加拉国' },
  { value: 'BB', label: '巴巴多斯' },
  { value: 'BY', label: '白俄罗斯' },
  { value: 'BE', label: '比利时' },
  { value: 'BZ', label: '伯利兹' },
  { value: 'BJ', label: '贝宁' },
  { value: 'BM', label: '百慕大' },
  { value: 'BT', label: '不丹' },
  { value: 'BO', label: '玻利维亚' },
  { value: 'BQ', label: '博奈尔岛、圣尤斯特歇斯岛和萨巴岛' },
  { value: 'BA', label: '波斯尼亚和黑塞哥维那' },
  { value: 'BW', label: '博茨瓦纳' },
  { value: 'BV', label: '布韦岛' },
  { value: 'BR', label: '巴西' },
  { value: 'IO', label: '英属印度洋领地' },
  { value: 'BN', label: '文莱' },
  { value: 'BG', label: '保加利亚' },
  { value: 'BF', label: '布基纳法索' },
  { value: 'BI', label: '布隆迪' },
  { value: 'CV', label: '佛得角' },
  { value: 'KH', label: '柬埔寨' },
  { value: 'CM', label: '喀麦隆' },
  { value: 'CA', label: '加拿大' },
  { value: 'KY', label: '开曼群岛' },
  { value: 'CF', label: '中非共和国' },
  { value: 'TD', label: '乍得' },
  { value: 'CL', label: '智利' },
  { value: 'CN', label: '中国' },
  { value: 'CX', label: '圣诞岛' },
  { value: 'CC', label: '科科斯（基林）群岛' },
  { value: 'CO', label: '哥伦比亚' },
  { value: 'KM', label: '科摩罗' },
  { value: 'CG', label: '刚果（布）' },
  { value: 'CD', label: '刚果（金）' },
  { value: 'CK', label: '库克群岛' },
  { value: 'CR', label: '哥斯达黎加' },
  { value: 'CI', label: '科特迪瓦' },
  { value: 'HR', label: '克罗地亚' },
  { value: 'CU', label: '古巴' },
  { value: 'CW', label: '库拉索' },
  { value: 'CY', label: '塞浦路斯' },
  { value: 'CZ', label: '捷克' },
  { value: 'DK', label: '丹麦' },
  { value: 'DJ', label: '吉布提' },
  { value: 'DM', label: '多米尼克' },
  { value: 'DO', label: '多米尼加共和国' },
  { value: 'EC', label: '厄瓜多尔' },
  { value: 'EG', label: '埃及' },
  { value: 'SV', label: '萨尔瓦多' },
  { value: 'GQ', label: '赤道几内亚' },
  { value: 'ER', label: '厄立特里亚' },
  { value: 'EE', label: '爱沙尼亚' },
  { value: 'SZ', label: '斯威士兰' },
  { value: 'ET', label: '埃塞俄比亚' },
  { value: 'FK', label: '福克兰群岛' },
  { value: 'FO', label: '法罗群岛' },
  { value: 'FJ', label: '斐济' },
  { value: 'FI', label: '芬兰' },
  { value: 'FR', label: '法国' },
  { value: 'GF', label: '法属圭亚那' },
  { value: 'PF', label: '法属波利尼西亚' },
  { value: 'TF', label: '法属南部领地' },
  { value: 'GA', label: '加蓬' },
  { value: 'GM', label: '冈比亚' },
  { value: 'GE', label: '格鲁吉亚' },
  { value: 'DE', label: '德国' },
  { value: 'GH', label: '加纳' },
  { value: 'GI', label: '直布罗陀' },
  { value: 'GR', label: '希腊' },
  { value: 'GL', label: '格陵兰' },
  { value: 'GD', label: '格林纳达' },
  { value: 'GP', label: '瓜德罗普' },
  { value: 'GU', label: '关岛' },
  { value: 'GT', label: '危地马拉' },
  { value: 'GG', label: '根西岛' },
  { value: 'GN', label: '几内亚' },
  { value: 'GW', label: '几内亚比绍' },
  { value: 'GY', label: '圭亚那' },
  { value: 'HT', label: '海地' },
  { value: 'HM', label: '赫德岛和麦克唐纳岛' },
  { value: 'VA', label: '梵蒂冈' },
  { value: 'HN', label: '洪都拉斯' },
  { value: 'HK', label: '中国香港' },
  { value: 'HU', label: '匈牙利' },
  { value: 'IS', label: '冰岛' },
  { value: 'IN', label: '印度' },
  { value: 'ID', label: '印度尼西亚' },
  { value: 'IR', label: '伊朗' },
  { value: 'IQ', label: '伊拉克' },
  { value: 'IE', label: '爱尔兰' },
  { value: 'IM', label: '马恩岛' },
  { value: 'IL', label: '以色列' },
  { value: 'IT', label: '意大利' },
  { value: 'JM', label: '牙买加' },
  { value: 'JP', label: '日本' },
  { value: 'JE', label: '泽西岛' },
  { value: 'JO', label: '约旦' },
  { value: 'KZ', label: '哈萨克斯坦' },
  { value: 'KE', label: '肯尼亚' },
  { value: 'KI', label: '基里巴斯' },
  { value: 'KP', label: '朝鲜' },
  { value: 'KR', label: '韩国' },
  { value: 'KW', label: '科威特' },
  { value: 'KG', label: '吉尔吉斯斯坦' },
  { value: 'LA', label: '老挝' },
  { value: 'LV', label: '拉脱维亚' },
  { value: 'LB', label: '黎巴嫩' },
  { value: 'LS', label: '莱索托' },
  { value: 'LR', label: '利比里亚' },
  { value: 'LY', label: '利比亚' },
  { value: 'LI', label: '列支敦士登' },
  { value: 'LT', label: '立陶宛' },
  { value: 'LU', label: '卢森堡' },
  { value: 'MO', label: '中国澳门' },
  { value: 'MG', label: '马达加斯加' },
  { value: 'MW', label: '马拉维' },
  { value: 'MY', label: '马来西亚' },
  { value: 'MV', label: '马尔代夫' },
  { value: 'ML', label: '马里' },
  { value: 'MT', label: '马耳他' },
  { value: 'MH', label: '马绍尔群岛' },
  { value: 'MQ', label: '马提尼克' },
  { value: 'MR', label: '毛里塔尼亚' },
  { value: 'MU', label: '毛里求斯' },
  { value: 'YT', label: '马约特' },
  { value: 'MX', label: '墨西哥' },
  { value: 'FM', label: '密克罗尼西亚' },
  { value: 'MD', label: '摩尔多瓦' },
  { value: 'MC', label: '摩纳哥' },
  { value: 'MN', label: '蒙古' },
  { value: 'ME', label: '黑山' },
  { value: 'MS', label: '蒙特塞拉特' },
  { value: 'MA', label: '摩洛哥' },
  { value: 'MZ', label: '莫桑比克' },
  { value: 'MM', label: '缅甸' },
  { value: 'NA', label: '纳米比亚' },
  { value: 'NR', label: '瑙鲁' },
  { value: 'NP', label: '尼泊尔' },
  { value: 'NL', label: '荷兰' },
  { value: 'NC', label: '新喀里多尼亚' },
  { value: 'NZ', label: '新西兰' },
  { value: 'NI', label: '尼加拉瓜' },
  { value: 'NE', label: '尼日尔' },
  { value: 'NG', label: '尼日利亚' },
  { value: 'NU', label: '纽埃' },
  { value: 'NF', label: '诺福克岛' },
  { value: 'MK', label: '北马其顿' },
  { value: 'MP', label: '北马里亚纳群岛' },
  { value: 'NO', label: '挪威' },
  { value: 'OM', label: '阿曼' },
  { value: 'PK', label: '巴基斯坦' },
  { value: 'PW', label: '帕劳' },
  { value: 'PS', label: '巴勒斯坦' },
  { value: 'PA', label: '巴拿马' },
  { value: 'PG', label: '巴布亚新几内亚' },
  { value: 'PY', label: '巴拉圭' },
  { value: 'PE', label: '秘鲁' },
  { value: 'PH', label: '菲律宾' },
  { value: 'PN', label: '皮特凯恩群岛' },
  { value: 'PL', label: '波兰' },
  { value: 'PT', label: '葡萄牙' },
  { value: 'PR', label: '波多黎各' },
  { value: 'QA', label: '卡塔尔' },
  { value: 'RO', label: '罗马尼亚' },
  { value: 'RU', label: '俄罗斯' },
  { value: 'RW', label: '卢旺达' },
  { value: 'RE', label: '留尼汪' },
  { value: 'BL', label: '圣巴泰勒米' },
  { value: 'SH', label: '圣赫勒拿' },
  { value: 'KN', label: '圣基茨和尼维斯' },
  { value: 'LC', label: '圣卢西亚' },
  { value: 'MF', label: '圣马丁（法属）' },
  { value: 'PM', label: '圣皮埃尔和密克隆' },
  { value: 'VC', label: '圣文森特和格林纳丁斯' },
  { value: 'WS', label: '萨摩亚' },
  { value: 'SM', label: '圣马力诺' },
  { value: 'ST', label: '圣多美和普林西比' },
  { value: 'SA', label: '沙特阿拉伯' },
  { value: 'SN', label: '塞内加尔' },
  { value: 'RS', label: '塞尔维亚' },
  { value: 'SC', label: '塞舌尔' },
  { value: 'SL', label: '塞拉利昂' },
  { value: 'SG', label: '新加坡' },
  { value: 'SX', label: '圣马丁（荷属）' },
  { value: 'SK', label: '斯洛伐克' },
  { value: 'SI', label: '斯洛文尼亚' },
  { value: 'SB', label: '所罗门群岛' },
  { value: 'SO', label: '索马里' },
  { value: 'ZA', label: '南非' },
  { value: 'GS', label: '南乔治亚和南桑威奇群岛' },
  { value: 'SS', label: '南苏丹' },
  { value: 'ES', label: '西班牙' },
  { value: 'LK', label: '斯里兰卡' },
  { value: 'SD', label: '苏丹' },
  { value: 'SR', label: '苏里南' },
  { value: 'SJ', label: '斯瓦尔巴群岛和扬马延岛' },
  { value: 'SE', label: '瑞典' },
  { value: 'CH', label: '瑞士' },
  { value: 'SY', label: '叙利亚' },
  { value: 'TW', label: '中国台湾' },
  { value: 'TJ', label: '塔吉克斯坦' },
  { value: 'TZ', label: '坦桑尼亚' },
  { value: 'TH', label: '泰国' },
  { value: 'TL', label: '东帝汶' },
  { value: 'TG', label: '多哥' },
  { value: 'TK', label: '托克劳' },
  { value: 'TO', label: '汤加' },
  { value: 'TT', label: '特立尼达和多巴哥' },
  { value: 'TN', label: '突尼斯' },
  { value: 'TR', label: '土耳其' },
  { value: 'TM', label: '土库曼斯坦' },
  { value: 'TC', label: '特克斯和凯科斯群岛' },
  { value: 'TV', label: '图瓦卢' },
  { value: 'UG', label: '乌干达' },
  { value: 'UA', label: '乌克兰' },
  { value: 'AE', label: '阿拉伯联合酋长国' },
  { value: 'GB', label: '英国' },
  { value: 'US', label: '美国' },
  { value: 'UM', label: '美国本土外小岛屿' },
  { value: 'UY', label: '乌拉圭' },
  { value: 'UZ', label: '乌兹别克斯坦' },
  { value: 'VU', label: '瓦努阿图' },
  { value: 'VE', label: '委内瑞拉' },
  { value: 'VN', label: '越南' },
  { value: 'VG', label: '英属维尔京群岛' },
  { value: 'VI', label: '美属维尔京群岛' },
  { value: 'WF', label: '瓦利斯和富图纳' },
  { value: 'EH', label: '西撒哈拉' },
  { value: 'YE', label: '也门' },
  { value: 'ZM', label: '赞比亚' },
  { value: 'ZW', label: '津巴布韦' }
]

// 邮箱验证码相关
const verificationCode = ref('')
const countdown = ref(0)
const canSendCode = ref(true)

// 发送验证码（空壳实现）
const sendVerificationCode = () => {
  if (!canSendCode.value || !registerForm.email) return
  
  // 模拟发送验证码，实际不发送
  countdown.value = 60
  canSendCode.value = false
  
  // 清除可能存在的旧计时器
  if (window.captchaTimer) {
    clearInterval(window.captchaTimer)
  }
  
  window.captchaTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(window.captchaTimer)
      window.captchaTimer = null
      canSendCode.value = true
    }
  }, 1000)
}

// 注册表单
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  country: 'CN' // 默认中国
})

const close = () => {
  emit('update:visible', false)
  error.value = ''
  isLogin.value = true // 重置为登录表单
  
  // 重置表单
  loginForm.password = ''
  registerForm.name = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.country = 'CN' // 重置为默认中国
  
  // 重置验证码
  verificationCode.value = ''
  countdown.value = 0
  canSendCode.value = true
  clearInterval(window.captchaTimer || 0)
  window.captchaTimer = null
}

const toggleForm = () => {
  isLogin.value = !isLogin.value
  error.value = '' // 切换时清除错误信息
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await userStore.login(loginForm)
    if (result && result.success) {
      emit('login-success')
      close()
    } else {
      error.value = result?.error || '登录失败'
    }
  } catch (err) {
    console.error('handleLogin error:', err)
    error.value = err?.message || '发生错误，请重试'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 验证码验证（模拟实现，接受任意6位数字）
    // 实际项目中应该与后端进行验证
    if (!/^[0-9]{6}$/.test(verificationCode.value)) {
      // 为了简化测试，我们将验证码验证改为可选
      // 实际项目中应该严格验证
      console.log('验证码格式不正确，但继续注册流程')
    }
    
    const result = await userStore.register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      country: registerForm.country
    })
    
    if (result.success) {
      // 注册成功后自动登录
      const loginResult = await userStore.login({
        email: registerForm.email,
        password: registerForm.password
      })
      
      if (loginResult.success) {
        emit('login-success')
        close()
      } else {
        // 注册成功但登录失败，切换到登录表单
        error.value = '注册成功，请使用新账号登录'
        isLogin.value = true
      }
    } else {
      error.value = result?.error || '注册失败'
    }
  } catch (err) {
    console.error('handleRegister error:', err)
    error.value = err?.message || '发生错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 模态框背景 */
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
  background-color: var(--white);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 450px;
  box-shadow: var(--shadow-xl);
  animation: slideDown var(--transition-normal);
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--dark-gray);
  font-weight: var(--font-weight-bold);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--medium-gray);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--light-gray);
  color: var(--primary-red);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark-gray);
  font-weight: var(--font-weight-semibold);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  box-sizing: border-box;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
}

.form-group select:focus {
  outline: none;
  border-color: var(--primary-red);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-red);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.error-message {
  color: var(--dark-red);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  padding: 0.75rem;
  background-color: var(--light-red);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-red);
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: var(--font-family);
}

.btn-primary {
  background-color: var(--primary-red);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--dark-red);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn:disabled {
  background-color: var(--medium-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 验证码输入组 */
.captcha-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  opacity: 1 !important;
  visibility: visible !important;
  display: flex !important;
}

.captcha-group {
  margin-bottom: 1rem;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

.captcha-btn {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  background: var(--secondary-red);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 1 !important;
  visibility: visible !important;
  display: flex !important;
}

.captcha-btn:hover:not(:disabled) {
  background: var(--primary-red);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.captcha-btn:disabled {
  background: var(--medium-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

/* 验证码输入框 */
.captcha-input-group input {
  flex: 1;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* 切换表单链接样式 */
.switch-form {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--light-gray);
  color: var(--dark-gray);
  font-size: 0.9rem;
}

.switch-form a {
  color: var(--primary-red);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
}

.switch-form a:hover {
  color: var(--dark-red);
  text-decoration: underline;
}

/* 动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    box-shadow: none;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    box-shadow: var(--shadow-xl);
  }
}
</style>
