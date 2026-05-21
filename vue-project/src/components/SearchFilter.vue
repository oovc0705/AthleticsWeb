<template>
  <section class="search-section">
    <div class="search-bar">
      <input 
        type="text" 
        :placeholder="placeholder" 
        class="search-input" 
        v-model="searchQuery"
        @input="onSearch"
      />
      <button class="search-btn">🔍</button>
    </div>
    <div class="filters">
      <select 
        v-for="(filter, index) in filters" 
        :key="index"
        class="filter-select"
        v-model="filter.selected"
        @change="onFilterChange"
      >
        <option v-for="option in filter.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索...'
  },
  filters: {
    type: Array,
    default: () => [
      {
        name: 'category',
        selected: 'all',
        options: [
          { value: 'all', label: '所有类别' },
          { value: 'sprint', label: '短跑' },
          { value: 'long', label: '长跑' }
        ]
      }
    ]
  }
})

const emit = defineEmits(['search', 'filter'])

const searchQuery = ref('')

const onSearch = () => {
  emit('search', searchQuery.value)
}

const onFilterChange = () => {
  emit('filter', props.filters.map(f => ({
    name: f.name,
    value: f.selected
  })))
}
</script>

<style scoped>
.search-section {
  padding: 2rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-bar {
  display: flex;
  background: var(--bg-light);
  border-radius: 2rem;
  overflow: hidden;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  border: none;
  padding: 1rem 1.5rem;
  background: transparent;
  outline: none;
}

.search-btn {
  background: var(--primary-color);
  border: none;
  padding: 1rem 1.5rem;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: var(--primary-dark);
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--element-bg);
  cursor: pointer;
}
</style>
