<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    fill="none" 
    :stroke="color" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="heart-icon"
    :class="{ 'filled': isFilled }"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
</template>

<script>
export default {
  name: 'HeartIcon',
  props: {
    isFilled: {
      type: Boolean,
      default: false
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script>

<style scoped>
.heart-icon {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.heart-icon:hover {
  transform: scale(1.1);
}

.filled {
  fill: #ef4444;
  stroke: #ef4444;
}
</style>
