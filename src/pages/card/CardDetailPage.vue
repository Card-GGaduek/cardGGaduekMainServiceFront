<script setup>
import { ref, onMounted, computed } from "vue"; // 💡 computed 추가
import { useRoute, useRouter } from "vue-router";
import api from "@/api/index.js";

const route = useRoute();
const router = useRouter();
const cardDetail = ref(null);
const isLoading = ref(true);
const error = ref(null); // 💡 에러 상태를 관리하기 위한 ref 추가

const categoryIcons = {
  COFFEE_SHOP: "☕️",
  RESTAURANT: "🍔",
  HOTEL: "🧳",
  MOVIE_THEATER: "🎡",
  GAS_STATION: "⛽️", // 🚀 아이콘을 ⛽️로 변경했습니다.
  CONVENIENCE_STORE: "🏪", // 🏥 아이콘을 🏪로 변경했습니다.
  // 필요한 다른 카테고리도 여기에 추가할 수 있습니다.
};

const categoryNamesKo = {
  COFFEE_SHOP: "커피전문점",
  RESTAURANT: "음식점",
  HOTEL: "호텔/숙박",
  MOVIE_THEATER: "영화/문화",
  GAS_STATION: "주유",
  CONVENIENCE_STORE: "편의점",
  // 필요한 다른 카테고리도 여기에 추가할 수 있습니다.
};

async function fetchCardDetail() {
  try {
    isLoading.value = true;
    error.value = null; // 에러 상태 초기화
    const productId = route.params.id;
    const response = await api.get(`api/card-products/${productId}`);
    cardDetail.value = response.data.data || response.data;
  } catch (err) {
    console.error("카드 상세 정보 실패:", err);
    error.value = "카드 정보를 불러오는 데 실패했습니다."; // 💡 에러 메시지 설정
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchCardDetail);

// 💡 그룹핑된 혜택 데이터를 위한 computed 속성 추가
const groupedBenefits = computed(() => {
  if (!cardDetail.value || !cardDetail.value.benefits) {
    return {};
  }
  // 'reduce' 함수를 사용해 배열을 카테고리별 객체로 변환합니다.
  return cardDetail.value.benefits.reduce((acc, benefit) => {
    const category = benefit.storeCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(benefit);
    return acc;
  }, {});
});

function goBack() {
  router.back();
}
function applyForCard() {
  if (cardDetail.value && cardDetail.value.cardApplyUrl) {
    alert(`${cardDetail.value.cardProductName} 신청 페이지로 이동합니다.`);
    window.open(cardDetail.value.cardApplyUrl, "_blank");
  } else {
    alert("카드 신청 링크가 준비되지 않았습니다.");
  }
}
</script>

<template>
  <div class="mobile-screen">
    <header class="page-header">
      <button class="back-button" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </button>
    </header>

    <main class="content-area">
      <div v-if="isLoading" class="status-message">로딩 중...</div>
      <div v-else-if="error" class="status-message error">{{ error }}</div>

      <div v-else-if="cardDetail" class="card-detail-container">
        <div class="card-image-wrapper">
          <img
            :src="cardDetail.cardImageUrl"
            :alt="cardDetail.cardProductName"
            class="card-image"
          />
        </div>

        <div class="card-name-wrapper">
          <h2 class="card-name">{{ cardDetail.cardProductName }}</h2>
        </div>

        <section class="info-summary-section">
          <div class="info-item">
            <div class="info-icon">💰</div>
            <div class="info-label">연회비</div>
            <div class="info-value">{{ cardDetail.annualFee }}원</div>
          </div>
          <div class="info-item">
            <div class="info-icon">📅</div>
            <div class="info-label">전월실적</div>
            <div class="info-value">
              {{ cardDetail.requiredMonthlySpent }}원 이상
            </div>
          </div>
        </section>

        <section class="benefits-section">
          <div
            v-for="(benefitsInGroup, category) in groupedBenefits"
            :key="category"
            class="category-group"
          >
            <div class="category-header">
              <span class="category-icon">{{
                categoryIcons[category] || "⭐️"
              }}</span>
              <h3 class="section-title">
                {{ categoryNamesKo[category] || category }}
              </h3>
            </div>

            <div class="benefit-text-wrapper">
              <p class="benefit-text-list">
                {{
                  benefitsInGroup
                    .map(
                      (benefit) => `${benefit.description}`
                    )
                    .join(" // ")
                }}
              </p>
            </div>
          </div>
        </section>
        <!-- <div
          v-for="(benefitsInGroup, category) in groupedBenefits"
          :key="category"
          class="category-group"
        >
          <div class="category-header">
            <span class="category-icon">{{
              categoryIcons[category] || "⭐️"
            }}</span>
            <h3 class="section-title">{{ category }}</h3>
          </div>

          <div class="benefit-list">
            <div
              v-for="(benefit, index) in benefitsInGroup"
              :key="index"
              class="benefit-item"
            >
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
          </div>
        </div> -->
      </div>
    </main>

    <footer v-if="cardDetail" class="page-footer">
      <button class="apply-button" @click="applyForCard">카드 신청하기</button>
    </footer>
  </div>
</template>

<style scoped>
/* 이전과 동일한 CSS를 사용합니다. */
:root {
  --main-yellow: #fdd835;
  --light-yellow: #fffde7;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  flex-shrink: 0;
}

.back-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  color: #333;
}
.content-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px 16px 16px; /* 💡 패딩 조정 */
}
.card-image-wrapper,
.card-name-wrapper,
.benefit-item {
  border: 2px solid var(--main-yellow);
}

.card-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center; /* 💡 세로 정렬 추가 */
  width: auto;
  height: 200px; /* 💡 상하 마진 추가 */
}

.card-image {
  transform: rotate(90deg);
  display: block;
  width: auto;
  /* 💡 회전 시 크기 조정을 위해 max-height 사용 */
  max-height: 180px;
}

.card-name-wrapper {
  text-align: center;
  background-color: var(--light-yellow);
}

.card-name {
  font-size: 20px;
  font-weight: 700;
  color: #3e2723;
  margin: 0;
}

.benefits-section {
  margin-top: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333; /* 💡 가독성을 위해 색상 변경 */
  background-color: var(--main-yellow);
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
}

.benefit-list {
  display: flex;
  flex-direction: column;
}

.benefit-item {
  background-color: var(--light-yellow);
  border-radius: 8px;
  padding: 16px;
}

.benefit-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600; /* 💡 폰트 두께 조정 */
  color: #333;
}

.benefit-icon {
  font-size: 20px;
  margin-right: 10px;
}

.benefit-description {
  font-size: 16px;
  color: #818690; /* 💡 가독성을 위해 색상 변경 */
  margin: 8px 0 0 0;
  line-height: 1.5;
  padding-left: 30px; /* 💡 아이콘 너비만큼 들여쓰기 */
}

.page-footer {
  padding: 16px;
  background-color: #fff; /* 💡 배경색 통일 */
  border-top: 1px solid #eee; /* 💡 구분선 추가 */
  flex-shrink: 0;
}

.apply-button {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #423100;
  background-color: #fbc02d;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.status-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.status-message.error {
  color: #dc3545;
}

.info-summary-section {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-top: 24px;
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid var(--light-yellow);
}

.info-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.card-detail-container {
  /* 전체 배경 */
  min-height: 100vh;
  padding-bottom: 20px; /* 💡 하단 패딩 */
  box-sizing: border-box;
}

/* 💡 카테고리 그룹핑을 위한 스타일 추가 */
.category-group {
  margin-bottom: 24px;
}

.category-group:last-child {
  margin-bottom: 0;
}
/* 기존의 .benefit-item, .benefit-title 등은 삭제하거나 그대로 두어도 괜찮습니다. */

.benefit-text-wrapper {
  background-color: var(--light-yellow); /* 기존 benefit-item과 유사한 배경 */
  border: 2px solid var(--main-yellow); /* 기존 benefit-item과 유사한 테두리 */
  padding: 16px;
  border-radius: 8px;
}

.benefit-text-list {
  font-size: 14px;
  color: #555;
  line-height: 1.6; /* 줄 간격 설정 */
  margin: 0; /* 단락의 기본 마진 제거 */
}
</style>
