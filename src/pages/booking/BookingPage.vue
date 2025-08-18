<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from '@/api/index.js';

// Layout 및 자식 컴포넌트들 import
import MainHeader from "@/layout/MainHeader.vue";
import BenefitCategorySelector from "@/components/booking/BenefitCategorySelector.vue";
import BenefitList from "@/components/booking/BenefitList.vue";


const router = useRouter();

// --- 상태 관리 (State Management) ---
const benefits = ref([]);
const isLoading = ref(true);
const selectedCategory = ref("여행"); // 이름으로 관리
const categories = ref([
  { name: "여행", icon: '🏨', apiValue: "HOTEL" },
  { name: "입장권", icon: '🎡', apiValue: "THEME_PARK" },
  { name: "쇼핑", icon: '🛒', apiValue: "SHOPPING" },
  { name: "문화", icon: '🎬', apiValue: "MOVIE_THEATER" },
]);

// --- API 통신 (Data Fetching) ---
async function fetchBenefits(categoryApiValue) {
  isLoading.value = true;
  benefits.value = [];
  try {
    const response = await api.get(`api/category/${categoryApiValue}`);
    if (response.data && response.data.data) {
      benefits.value = response.data.data;
    } else {
      benefits.value = [];
    }
  } catch (error) {
    console.error(`${categoryApiValue} 카테고리 조회 실패:`, error);
    benefits.value = [];
  } finally {
    isLoading.value = false;
  }
}

// --- 이벤트 핸들러 (Event Handlers) ---
function handleCategorySelect(category) {
  selectedCategory.value = category.name;
  fetchBenefits(category.apiValue);
}

function handleBooking(benefit) {
  router.push({
    name: "BookingAccommodationPage",
    params: { id: benefit.id },
  });
}

// --- 생명주기 훅 (Lifecycle Hook) ---
onMounted(() => {
  const defaultCategory = categories.value.find(
    (c) => c.name === selectedCategory.value
  );
  if (defaultCategory) {
    fetchBenefits(defaultCategory.apiValue);
  }
});

// computed 속성은 이제 필요 없습니다. BenefitList로 데이터를 바로 넘겨주면 됩니다.
</script>

<template>
  <MainHeader/>
  <div class="benefit-page-bg">
    <div class="container benefit-page-container">
      
      <h3 class="fw-bolder text-center mt-3">혜택도, 예약도 한 번에!</h3>
      <p class="text-muted small text-center">
        상황을 선택하고,<br />혜택을 가장 많이 받는 카드로 예약하세요!
      </p>
      
      <BenefitCategorySelector
        :categories="categories"
        :selected-category-name="selectedCategory"
        @select="handleCategorySelect"
      />

      <BenefitList
        :benefits="benefits"
        :is-loading="isLoading"
        :selected-category-name="selectedCategory"
        @book-benefit="handleBooking"
      />

    </div>
  </div>
</template>

<style scoped>
/* 전체 페이지에만 해당하는 스타일만 남겨둡니다. */
.benefit-page-bg {
  background-color: white;
}
.benefit-page-container {
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}
header {
  flex-shrink: 0;
}
</style>