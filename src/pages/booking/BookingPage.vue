<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router"; // 1. authStore 가져오기
import api from '@/api/index.js';

const router = useRouter(); 
const benefits = ref([]);
const isLoading = ref(true);
const selectedCategory = ref("여행");

const categories = ref([
  { name: "여행", icon: "fa-solid fa-plane", apiValue: "HOTEL" },
  { name: "입장권", icon: "fa-solid fa-ticket", apiValue: "THEME_PARK" },
  { name: "쇼핑", icon: "fa-solid fa-bag-shopping", apiValue: "SHOPPING" },
  { name: "문화", icon: "fa-solid fa-film", apiValue: "MOVIE_THEATER" },
]);

const filteredBenefits = computed(() => {
  return benefits.value;
});

async function fetchBenefits(categoryApiValue) {
  isLoading.value = true;
  benefits.value = [];
  try {
    // memberId를 가져오거나 보낼 필요가 없음!
    // 서버가 쿠키/토큰을 보고 알아서 처리해줌.
    const response = await api.get(`api/category/${categoryApiValue}`); // params 제거
    console.log(response.data.data);
    if (response.data && response.data.data) {
      benefits.value = response.data.data || response.data;
      console.log(benefits.value);
    } else {
      benefits.value = []; // 데이터가 없는 경우 빈 배열로 설정
    }

  } catch (error) {
    console.error(`${categoryApiValue} 카테고리 조회 실패:`, error);
    benefits.value = []; // 에러 발생 시에도 빈 배열로 초기화
  } finally {
    isLoading.value = false;
  }
}
function calculateExpectedPrice(benefit) {
  const basePrice = benefit.price || 0;
  if (benefit.discountRate <= 50) {
    return Math.floor(benefit.price * (benefit.discountRate / 100));
  }
  return benefit.discountRate;
}

function selectCategory(category) {
  selectedCategory.value = category.name;
  fetchBenefits(category.apiValue);
}

onMounted(() => {
  const defaultCategory = categories.value.find(
    (c) => c.name === selectedCategory.value
  );
  if (defaultCategory) {
    fetchBenefits(defaultCategory.apiValue);
  }
});

function handleBooking(benefit) {
  router.push({
    name: "BookingAccommodationPage",
    params: { id: benefit.id },
  });
}
</script>

<template>
  <div class="benefit-page-bg">
    <div class="container benefit-page-container">
      <header class="pt-4 mb-4">
        <h5 class="fw-bold mb-4">카드까득</h5>
        <h2 class="fw-bolder text-center">혜택도, 예약도 한 번에!</h2>
        <p class="text-muted small text-center">
          상황을 선택하고,<br />혜택을 가장 많이 받는 카드로 예약하세요!
        </p>
      </header>

      <div class="scrollable-content">
        <div class="card main-category-card mb-4">
          <div class="card-body">
            <section
              class="main-categories d-flex justify-content-around text-center"
            >
              <div
                v-for="category in categories"
                :key="category.apiValue"
                class="category-item"
                @click="selectCategory(category)"
              >
                <div
                  class="icon-wrapper"
                  :class="{ active: selectedCategory === category.name }"
                >
                  <i :class="category.icon"></i>
                </div>
                <span class="small">{{ category.name }}</span>
              </div>
            </section>
          </div>
        </div>

        <main class="benefit-list">
          <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border" role="status"></div>
          </div>
          <div
            v-else-if="filteredBenefits.length === 0"
            class="text-center p-5 text-muted"
          >
            표시할 혜택 정보가 없습니다.
          </div>
          <div
            v-else
            class="card benefit-card mb-3"
            v-for="benefit in filteredBenefits"
            :key="benefit.id"
          >
            <div class="card-body d-flex align-items-center">
              <img
                :src="benefit.imageUrl"
                class="rounded me-3 benefit-image"
                alt="Benefit Image"
              />

              <div class="flex-grow-1">
                <p class="card-text small mb-2">
                  보유하신 {{ benefit.cardName }}로 {{ benefit.title }}에서

                  <span class="text-highlight fw-bold">
                    <span v-if="benefit.discountRate < 50">
                      최대 {{ benefit.discountRate }}% 할인
                    </span>
                    <span v-else>
                      최대 {{ benefit.discountRate }}원 할인
                    </span>
                  </span>

                  을 받을 수 있습니다.
                </p>
                <p class="card-text small mb-2 fw-bold">
                  예상 혜택 금액 : {{ calculateExpectedPrice(benefit) }}원
                </p>

                <a
                  v-if="selectedCategory === '여행'"
                  @click.prevent="handleBooking(benefit)"
                  href="#"
                  class="stretched-link text-decoration-none text-muted small"
                >
                  예약하기 <i class="bi bi-chevron-right"></i>
                </a>
                <a
                  v-else
                  :href="benefit.linkUrl || '#'"
                  target="_blank"
                  class="stretched-link text-decoration-none text-muted small"
                >
                  자세히 보기 <i class="bi bi-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 전체 페이지 스타일 */
.benefit-page-bg {
  background-color: white;
}
.benefit-page-container {
  max-width: 420px;
  background-color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
header {
  flex-shrink: 0;
}
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 12px;
}
/* 카드 스타일 */
.main-category-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.category-item {
  cursor: pointer;
}
.category-item .icon-wrapper {
  width: 60px;
  height: 60px;
  background-color: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 1.5rem;
  color: #6c757d;
  border: 2px solid #f0f0f0;
}
.category-item .icon-wrapper.active {
  border-color: #0d6efd;
  color: #0d6efd;
}

/* 서브 카테고리 탭 */
.sub-category-tabs {
  border-bottom: 2px solid #dee2e6;
}
.sub-category-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: bold;
}
.sub-category-tabs .nav-link.active {
  color: #000;
  border-bottom: 2px solid #ff9900;
}

/* 혜택 카드 */
.benefit-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.benefit-card img {
  width: 120px;
  height: 80px;
  object-fit: cover;
}
.text-highlight {
  color: #ff9900;
}
</style>