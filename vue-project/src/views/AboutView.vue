<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="content">
        <h1>{{ t('about.hero.title') }}</h1>
        <p>{{ t('about.hero.subtitle') }}</p>
      </div>
    </section>

    <!-- About Content -->
    <main class="about-content">
      <div class="content">
        <!-- Organization Overview -->
        <section class="about-section">
          <div class="section-header">
            <h2>{{ t('about.organization.title') }}</h2>
            <p>{{ t('about.organization.subtitle') }}</p>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">187</div>
              <div class="stat-label">{{ t('about.organization.stats.members') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">3,500+</div>
              <div class="stat-label">{{ t('about.organization.stats.athletes') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">45</div>
              <div class="stat-label">{{ t('about.organization.stats.events') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50年+</div>
              <div class="stat-label">{{ t('about.organization.stats.history') }}</div>
            </div>
          </div>
        </section>

        <!-- Mission & Vision -->
        <section class="mission-vision-section">
          <div class="mission-card">
            <div class="card-icon">🎯</div>
            <h3>{{ t('about.mission.title') }}</h3>
            <p>{{ t('about.mission.description') }}</p>
            <ul class="mission-list">
              <li v-for="(item, index) in missionItems" :key="index">✓ {{ item }}</li>
            </ul>
          </div>
          
          <div class="vision-card">
            <div class="card-icon">🌟</div>
            <h3>{{ t('about.vision.title') }}</h3>
            <p>{{ t('about.vision.description') }}</p>
            <ul class="vision-list">
              <li v-for="(item, index) in visionItems" :key="index">● {{ item }}</li>
            </ul>
          </div>
        </section>

        <!-- History Timeline -->
        <section class="history-section">
          <h2>{{ t('about.history.title') }}</h2>
          <div class="timeline">
            <div v-for="(item, index) in historyItems" :key="index" class="timeline-item">
              <div class="timeline-year">{{ item.year }}</div>
              <div class="timeline-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Leadership Team -->
        <section class="leadership-section">
          <h2>{{ t('about.leadership.title') }}</h2>
          <div class="leaders-grid">
            <div v-for="(member, index) in leadershipMembers" :key="index" class="leader-card">
              <!-- 使用头像占位符，显示姓氏首字母 -->
              <div class="leader-photo-placeholder">{{ member.name.charAt(0) }}</div>
              <h4>{{ member.name }}</h4>
              <p class="position">{{ member.position }}</p>
              <p class="bio">{{ member.bio }}</p>
            </div>
          </div>
        </section>

        <!-- Contact Information -->
        <section class="contact-section">
          <h2>{{ t('about.contact.title') }}</h2>
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div>
                <h4>{{ t('about.contact.items.email') }}</h4>
                <p>info@worldathletics.org</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📞</div>
              <div>
                <h4>{{ t('about.contact.items.phone') }}</h4>
                <p>+86 400-123-4567</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">🏢</div>
              <div>
                <h4>{{ t('about.contact.items.address') }}</h4>
                <p>北京市朝阳区体育中心路888号</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="content">
        <p>{{ t('about.footer.copyright') }}</p>
        <div class="footer-links">
          <a href="#">{{ t('about.footer.links.privacy') }}</a>
          <a href="#">{{ t('about.footer.links.terms') }}</a>
          <a href="#">{{ t('about.footer.links.contact') }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t, locale, getLocaleMessage } = useI18n()

// 获取当前语言的翻译数据，使用 getLocaleMessage() 方法
const missionItems = computed(() => getLocaleMessage(locale.value).about.mission.items)
const visionItems = computed(() => getLocaleMessage(locale.value).about.vision.items)
const historyItems = computed(() => getLocaleMessage(locale.value).about.history.items)
const leadershipMembers = computed(() => getLocaleMessage(locale.value).about.leadership.members)
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--element-bg);
  color: var(--element-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}


/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--white);
  padding: 4rem 0;
  text-align: center;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 800;
}

.hero-section p {
  font-size: 1.2rem;
}

/* About Content */
.about-content {
  padding: 3rem 0;
}

/* Section Styles */
.about-section {
  margin-bottom: 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.2rem;
  color: var(--element-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  background: var(--light-gray);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: var(--element-color);
}

/* Mission & Vision */
.mission-vision-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 4rem;
}

.mission-card,
.vision-card {
  background: var(--element-bg);
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  padding: 2rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.mission-card:hover,
.vision-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.1);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.mission-card h3,
.vision-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
}

.mission-list,
.vision-list {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
}

.mission-list li,
.vision-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

/* Timeline */
.history-section {
  margin-bottom: 4rem;
}

.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--primary-color);
}

.timeline-item {
  display: flex;
  margin-bottom: 3rem;
  position: relative;
}

.timeline-year {
  background: var(--primary-color);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  min-width: 80px;
  text-align: center;
  margin-right: 2rem;
}

.timeline-content {
  flex: 1;
  background: var(--light-gray);
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.timeline-content h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

/* Leadership */
.leadership-section {
  margin-bottom: 4rem;
}

.leaders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.leader-card {
  text-align: center;
  background: var(--element-bg);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.leader-card:hover {
  transform: translateY(-5px);
}

.leader-photo,
.leader-photo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
}

/* 头像占位符样式 */
.leader-photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--white);
  text-align: center;
  line-height: 1;
}

.leader-card h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.position {
  font-weight: 600;
  color: var(--element-color);
  margin-bottom: 1rem;
}

.bio {
  color: var(--element-color);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Contact */
.contact-section {
  margin-bottom: 4rem;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--light-gray);
  border-radius: 0.5rem;
}

.contact-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.contact-item h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

/* Footer */
.footer {
  background: var(--dark-gray);
  color: var(--white);
  padding: 2rem 0;
  margin-top: 3rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.footer .content {
  text-align: center;
}

.footer-links {
  margin-top: 1rem;
}

.footer-links a {
  color: var(--white);
  text-decoration: none;
  margin: 0 1rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .header .content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    gap: 1rem;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .mission-vision-section {
    grid-template-columns: 1fr;
  }
  
  .timeline::before {
    left: 20px;
  }
  
  .timeline-year {
    min-width: 60px;
    margin-right: 1rem;
  }
}
</style>
