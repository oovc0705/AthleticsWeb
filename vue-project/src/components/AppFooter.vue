<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">{{ t('footer.title') }}</h3>
        <p class="footer-description">
          {{ t('footer.description') }}
        </p>
        <div class="social-media">
          <a href="#" class="social-link" aria-label="Facebook">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="#" class="social-link" aria-label="YouTube">
            <i class="fab fa-youtube"></i>
          </a>
        </div>
      </div>

      <div class="footer-section">
        <h4 class="footer-subtitle">{{ t('footer.quickLinks') }}</h4>
        <ul class="footer-links">
          <li><RouterLink to="/" class="footer-link">{{ t('header.home') }}</RouterLink></li>
          <li><RouterLink to="/events" class="footer-link">{{ t('footer.eventsSchedule') }}</RouterLink></li>
          <li><RouterLink to="/athletes" class="footer-link">{{ t('header.athletes') }}</RouterLink></li>
          <li><RouterLink to="/news" class="footer-link">{{ t('footer.news') }}</RouterLink></li>
          <li><RouterLink to="/about" class="footer-link">{{ t('footer.aboutUs') }}</RouterLink></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-subtitle">{{ t('footer.contactUs') }}</h4>
        <ul class="contact-info">
          <li class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>北京市朝阳区奥林匹克公园</span>
          </li>
          <li class="contact-item">
            <i class="fas fa-phone"></i>
            <span>+86 10 8888 8888</span>
          </li>
          <li class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>info@worldathletics.com</span>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-subtitle">{{ t('footer.subscribe') }}</h4>
        <p class="subscribe-text">{{ t('footer.subscribeText') }}</p>
        <form class="subscribe-form" @submit.prevent="subscribe">
          <input
            type="email"
            :placeholder="t('footer.emailPlaceholder')"
            class="subscribe-input"
            v-model="email"
            required
          />
          <button type="submit" class="subscribe-btn">{{ t('footer.subscribeBtn') }}</button>
        </form>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="bottom-content">
        <p class="copyright">
          {{ t('footer.copyright', { year: currentYear }) }}
        </p>
        <div class="footer-legal">
          <a href="#" class="legal-link">{{ t('footer.privacyPolicy') }}</a>
          <a href="#" class="legal-link">{{ t('footer.termsOfService') }}</a>
          <a href="#" class="legal-link">{{ t('footer.cookiePolicy') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const email = ref('')

const currentYear = computed(() => new Date().getFullYear())

const subscribe = () => {
  // 模拟订阅操作
  alert(t('footer.subscribeSuccess'))
  email.value = ''
}
</script>

<style scoped>
.app-footer {
  background-color: var(--header-bg);
  color: var(--header-text);
  padding: var(--space-xl) 0;
  font-family: var(--font-family);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.footer-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin-bottom: var(--space-sm);
}

.footer-description {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: var(--space-md);
}

.social-media {
  display: flex;
  gap: var(--space-sm);
}

.social-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--white);
  transition: all var(--transition-normal);
  text-decoration: none;
}

.social-link:hover {
  background-color: var(--primary-color);
  transform: translateY(-3px);
}

.footer-subtitle {
  font-size: 1.1rem;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-md);
  color: var(--header-text);
}

.footer-links {
  list-style: none;
}

.footer-link {
  display: block;
  color: var(--text-light);
  text-decoration: none;
  margin-bottom: var(--space-xs);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.contact-info {
  list-style: none;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-light);
  margin-bottom: var(--space-xs);
}

.contact-item i {
  color: var(--primary-color);
  width: 20px;
  text-align: center;
}

.subscribe-text {
  color: var(--text-light);
  margin-bottom: var(--space-sm);
  line-height: 1.5;
}

.subscribe-form {
  display: flex;
  gap: var(--space-xs);
  flex-direction: column;
}

.subscribe-input {
  padding: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--header-text);
  font-size: 0.9rem;
}

.subscribe-input::placeholder {
  color: var(--text-light);
}

.subscribe-input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
}

.subscribe-btn {
  padding: var(--space-sm);
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.subscribe-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--space-md);
}

.bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-align: center;
}

.copyright {
  color: var(--text-light);
  font-size: 0.9rem;
}

.footer-legal {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}

.legal-link {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color var(--transition-fast);
}

.legal-link:hover {
  color: var(--primary-color);
}

/* 响应式设计 */
@media (min-width: 768px) {
  .bottom-content {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

@media (max-width: 767px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .footer-section {
    text-align: center;
  }
  
  .social-media {
    justify-content: center;
  }
  
  .contact-item {
    justify-content: center;
  }
}
</style>
