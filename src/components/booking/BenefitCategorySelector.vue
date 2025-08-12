<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
  },
  selectedCategoryName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["select"]);

function selectCategory(category) {
  emit("select", category);
}
</script>

<template>
  <div class="card main-category-card">
    <div class="card-body">
      <section class="main-categories d-flex justify-content-around text-center">
        <div
          v-for="category in categories"
          :key="category.apiValue"
          class="category-item"
          @click="selectCategory(category)"
        >
          <div
            class="icon-wrapper"
            :class="{ active: selectedCategoryName === category.name }"
          >
            <i :class="category.icon">{{ category.icon }}</i>
            <span class="small">{{ category.name }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.main-category-card {
  border: none;
  margin: 0;
}
.category-item {
  cursor: pointer;
}
.category-item .icon-wrapper {
  width: 78.05px;
  height: 85px;
  background-color: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  color: #6c757d;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.3s ease-in-out, color 0.3s ease-in-out;
}
.icon-wrapper i {
  font-size: 2rem;
}
.icon-wrapper.active {
  box-shadow: 0 0 0 5px #FFCD39;
}
</style>