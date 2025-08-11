<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router"; // 1. authStore 가져오기
import api from '@/api/index.js';
import MainHeader from "@/layout/MainHeader.vue";

const router = useRouter(); 
const benefits = ref([]);
const isLoading = ref(true);
const selectedCategory = ref("여행");

const categories = ref([
  { name: "여행", icon: '🏨', apiValue: "HOTEL" },
  { name: "입장권", icon: '🎡', apiValue: "THEME_PARK" },
  { name: "쇼핑", icon: '🛒', apiValue: "SHOPPING" },
  { name: "문화", icon: '🎬', apiValue: "MOVIE_THEATER" },
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
  <MainHeader/>
  <div class="benefit-page-bg">
    <div class="container benefit-page-container">
      
        <h3 class="fw-bolder text-center mt-3">혜택도, 예약도 한 번에!</h3>
        <p class="text-muted small text-center">
          상황을 선택하고,<br />혜택을 가장 많이 받는 카드로 예약하세요!
        </p>
      

      <div>
        <div class="card main-category-card">
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
                  <i :class="category.icon">{{ category.icon }}</i>
                  <span class="small">{{ category.name }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <main class="benefit-list scrollable-content">
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
  margin: 0;
  /* border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); */
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
  margin-bottom: 2;
  color: #6c757d;

  /* ↓↓↓ 1. 평소 상태의 그림자 (퍼짐 값은 0) ↓↓↓ */
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.12);

  /* ↓↓↓ 3. box-shadow 속성에 전환 효과 적용 ↓↓↓ */
  transition: box-shadow 0.3s ease-in-out, color 0.3s ease-in-out;
}

.icon-wrapper i {
  /* 이 값을 조절하여 아이콘 크기를 키우세요. */
  font-size: 2rem; /* 예: 1.5rem -> 2rem으로 변경 */
  
}

.icon-wrapper.active {
  /* 아이콘/텍스트 색상 변경 */

  /* ↓↓↓ 2. 테두리 모양의 그림자 (x, y, blur는 0 / 퍼짐 값은 2px) ↓↓↓ */
  box-shadow: 0 0 0 5px #FFCD39;
}

/* 혜택 카드 */
.benefit-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-size: 14px;
}

.benefit-card img {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.text-highlight {
  color: #ff9900;
}
</style>