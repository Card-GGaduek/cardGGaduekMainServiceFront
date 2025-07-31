<script setup>
import { ref, computed } from 'vue';

// 1. 데이터를 서브 카테고리까지 포함하는 중첩 구조로 변경합니다.
const allBenefitsData = ref({
  '여행': {
    '숙박': [
      { id: 1, imageUrl: 'https://placehold.co/120x80/63A2FF/FFFFFF?text=Hotel', cardName: '카카오뱅크 줍줍카드', storeName: '롯데 리조트', discountRate: 15, expectedBenefit: 30000 },
      { id: 2, imageUrl: 'https://placehold.co/120x80/63A2FF/FFFFFF?text=Hotel', cardName: '현대 스마일카드', storeName: '신라 호텔', discountRate: 10, expectedBenefit: 50000 },
    ],
    '입장권': [
      { id: 9, imageUrl: 'https://placehold.co/120x80/00BFFF/FFFFFF?text=Ticket', cardName: '국민 체크카드', storeName: '에버랜드', discountRate: 50, expectedBenefit: 28000 },
    ]
  },
  'OTT': {
    '미디어': [
      { id: 3, imageUrl: 'https://placehold.co/120x80/000000/FFFFFF?text=Media', cardName: '신한 까득카드', storeName: '넷플릭스', discountRate: 20, expectedBenefit: 4500 },
      { id: 4, imageUrl: 'https://placehold.co/120x80/E50914/FFFFFF?text=Media', cardName: '국민 체크카드', storeName: '디즈니+', discountRate: 5, expectedBenefit: 1500 },
    ],
    '뮤직': [
      { id: 10, imageUrl: 'https://placehold.co/120x80/1DB954/FFFFFF?text=Music', cardName: '현대 스마일카드', storeName: 'Spotify', discountRate: 10, expectedBenefit: 1100 },
    ]
  },
  '쇼핑': [
    { id: 5, imageUrl: 'https://placehold.co/120x80/55C25A/FFFFFF?text=ShopA', cardName: '카카오뱅크 줍줍카드', storeName: 'G마켓', discountRate: 15, expectedBenefit: 15000 },
    { id: 6, imageUrl: 'https://placehold.co/120x80/FF6600/FFFFFF?text=ShopB', cardName: '현대 스마일카드', storeName: '쿠팡', discountRate: 10, expectedBenefit: 10000 },
  ],
  '문화': [
    { id: 7, imageUrl: 'https://placehold.co/120x80/C71585/FFFFFF?text=ArtA', cardName: '신한 까득카드', storeName: '메가박스', discountRate: 20, expectedBenefit: 4000 },
  ]
});


const selectedCategory = ref('여행');
// 2. 현재 선택된 '서브' 카테고리를 저장할 상태 변수 추가
const selectedSubCategory = ref('숙박');

const categories = ref([
  { name: '여행', icon: 'fa-solid fa-plane' }, // 'bi-map-fill' -> 'fa-solid fa-plane'
  { name: 'OTT', icon: 'fa-solid fa-tv' },
  { name: '쇼핑', icon: 'fa-solid fa-bag-shopping' },
  { name: '문화', icon: 'fa-solid fa-ticket' },
]);

const subCategoryMenus = ref({
  '여행': ['숙박', '입장권'],
  'OTT': ['미디어', '뮤직'],
});

const currentSubMenus = computed(() => {
  return subCategoryMenus.value[selectedCategory.value] || [];
});

// 3. 필터링 로직을 서브 카테고리까지 보도록 수정
const filteredBenefits = computed(() => {
  const mainCategoryData = allBenefitsData.value[selectedCategory.value];
  if (!mainCategoryData) return [];

  // 서브 카테고리가 있는 경우 (여행, OTT)
  if (currentSubMenus.value.length > 0) {
    return mainCategoryData[selectedSubCategory.value] || [];
  }
  
  // 서브 카테고리가 없는 경우 (쇼핑, 문화)
  return mainCategoryData;
});

// 4. 메인 카테고리 선택 함수 수정
function selectCategory(categoryName) {
  selectedCategory.value = categoryName;
  // 메인 카테고리 변경 시, 해당 카테고리의 첫 번째 서브메뉴를 기본값으로 선택
  const newSubMenus = subCategoryMenus.value[categoryName];
  selectedSubCategory.value = newSubMenus ? newSubMenus[0] : null;
}

// 5. 서브 카테고리 선택 함수 추가
function selectSubCategory(subCategoryName) {
  selectedSubCategory.value = subCategoryName;
}
</script>

<template>
  <div class="benefit-page-bg">
    <div class="container benefit-page-container">
      <header class="pt-4 mb-4">
        <h5 class="fw-bold mb-4">카드까득</h5>
        <h2 class="fw-bolder text-center">혜택도, 예약도 한 번에!</h2>
        <p class="text-muted small text-center">상황을 선택하고,<br>혜택을 가장 많이 받는 카드로 예약하세요!</p>
      </header>
      
      <div class="scrollable-content">
        <section class="main-categories d-flex justify-content-around text-center mb-4">
          <div 
            v-for="category in categories" 
            :key="category.name" 
            class="category-item"
            @click="selectCategory(category.name)">
            <div class="icon-wrapper" :class="{ active: selectedCategory === category.name }">
              <i class="bi" :class="category.icon"></i>
            </div>
            <span class="small">{{ category.name }}</span>
          </div>
        </section>

        <ul v-if="currentSubMenus.length > 0" class="nav nav-tabs nav-justified sub-category-tabs mb-4">
          <li v-for="menu in currentSubMenus" :key="menu" class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: selectedSubCategory === menu }" 
              href="#"
              @click.prevent="selectSubCategory(menu)">
              {{ menu }}
            </a>
          </li>
        </ul>
        <main class="benefit-list">
          <div class="card benefit-card mb-3" v-for="benefit in filteredBenefits" :key="benefit.id">
            <div class="card-body d-flex align-items-center">
              <img :src="benefit.imageUrl" class="rounded me-3" alt="Benefit Image">
              <div class="flex-grow-1">
                <p class="card-text small mb-2">
                  보유하신 {{ benefit.cardName }}로 {{ benefit.storeName }}에서
                  <span class="text-highlight fw-bold">최대 {{ benefit.discountRate }}% 할인</span>을 받을 수 있습니다.
                </p>
                <p class="card-text small mb-2 fw-bold">
                  예상 혜택 금액 : {{ benefit.expectedBenefit.toLocaleString() }}원
                </p>
                <router-link
                  v-if="selectedCategory === '여행'"
                  :to="{ name: 'BookingAccommodationPage', params: { id: benefit.id } }"
                  class="stretched-link text-decoration-none text-muted small">
                  예약하기 <i class="bi bi-chevron-right"></i>
                  </router-link>
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
  padding-bottom: 80px; /* 하단 네비게이션 공간 확보 */
}
.benefit-page-container {
  max-width: 420px;
  background-color: white;
  height: calc(100vh - 80px); /* 하단 네비게이션 높이를 뺀 화면 전체 높이 */
  display: flex;
  flex-direction: column;
}
/* 헤더는 높이가 줄어들지 않도록 설정 */
header {
  flex-shrink: 0;
}
/* 스크롤될 영역을 flex-grow로 남은 공간을 모두 차지하게 하고, overflow로 스크롤 생성 */
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px; /* 스크롤바 공간 확보 */
}

/* 메인 카테고리 아이콘 */
.category-item { 
    cursor: pointer; /* 클릭 가능하도록 커서 변경 */
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
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  font-size: 1.5rem;
  color: #6c757d;
  border: 2px solid #f0f0f0; /* 비활성 테두리 색상 */
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.benefit-card img {
  width: 120px;
  height: 80px;
  object-fit: cover;
}
.text-highlight {
  color: #ff9900;
}

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px; /* 높이 명시 */
  border-top: 1px solid #dee2e6;
  max-width: 420px;
  margin: 0 auto;
  background-color: #fff; /* 배경색 추가 */
}
.bottom-nav-text {
  font-size: 0.75rem;
}
</style>