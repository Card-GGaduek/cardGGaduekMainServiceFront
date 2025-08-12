<script setup>
import BenefitCard from "@/components/booking/BenefitCard.vue";

const props = defineProps({
  benefits: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
  selectedCategoryName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['book-benefit']);

function handleBooking(benefit) {
    emit('book-benefit', benefit);
}
</script>

<template>
  <main class="benefit-list scrollable-content">
    <div v-if="isLoading" class="text-center p-5">
      <div class="spinner-border" role="status"></div>
    </div>
    <div
      v-else-if="benefits.length === 0"
      class="text-center p-5 text-muted"
    >
      표시할 혜택 정보가 없습니다.
    </div>
    <div v-else>
      <BenefitCard
        v-for="benefit in benefits"
        :key="benefit.id"
        :benefit="benefit"
        :is-travel-category="selectedCategoryName === '여행'"
        @book="handleBooking"
      />
    </div>
  </main>
</template>

<style scoped>
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 22px;
}
</style>