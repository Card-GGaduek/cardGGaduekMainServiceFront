  <template>
    <div class="map-container">
      <!-- 지도 영역 -->
      <div ref="mapDiv" class="map-view"></div>

      <!-- 검색 및 MyCard UI -->
      <div class="controls-container">
        <div class="controls-box">
          <p class="title">내 카드로 혜택받을 수 있는 매장을 찾아보세요</p>

          <!-- 카드 1장만 보여주기 -->
          <div class="selected-card-box" v-if="selectedCard">
            <img :src="selectedCard.image" :alt="selectedCard.name" class="selected-card-img" />
            <div class="selected-card-info">
              <p class="card-name">{{ selectedCard.name }}</p>
              <p class="card-category">카테고리: {{ selectedCard.category }}</p>
            </div>
          </div>

          <!-- 검색창 -->
          <div class="search-bar">
            <input
              v-model="keyword"
              @keyup.enter="handleSearch"
              placeholder="매장 키워드를 입력하세요"
              class="search-input"
            />
            <button @click="handleSearch" class="search-button">검색</button>
          </div>
        </div>

        <!-- 현재 위치/재검색 -->
        <div class="research-area">
          <button @click="handleSearch" class="research-button">📍 현재 지도에서 재검색</button>
          <button @click="moveToCurrentLocation" class="location-button" aria-label="현재 위치로 이동">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 하단 상세 정보 시트 -->
      <transition name="bottom-sheet">
        <div v-if="selectedMerchant" class="bottom-sheet-container">
          <div class="bottom-sheet-content">
            <button @click="selectedMerchant = null" class="close-button">&times;</button>
            <h2 class="merchant-name">{{ selectedMerchant.name }}</h2>
            <p class="merchant-category">{{ selectedMerchant.primaryType }}</p>

            <div class="benefits-list">
              <h3 class="benefits-title">받을 수 있는 혜택</h3>
              <div
                v-for="benefit in selectedMerchant.benefits"
                :key="benefit.cardName"
                class="benefit-item"
                :class="{ 'primary': benefit.isPrimary }"
              >
                <p class="benefit-desc">{{ benefit.description }}</p>
                <p class="benefit-card">{{ benefit.cardName }} | {{ benefit.rateValue }}% 할인</p>
                <span v-if="benefit.isPrimary">🥇</span>
              </div>
            </div>

            <button class="navigator-button">🥇 페이 내비게이터 실행하기</button>
          </div>
        </div>
      </transition>
    </div>
  </template>

  <script setup>
  import { useMap } from '@/pages/map/map';

  const {
    mapDiv,
    keyword,
    selectedCard,
    selectedMerchant,
    handleSearch,
    
    moveToCurrentLocation,
  } = useMap();
  </script>

  <style>
  @import '@/assets/main.css';
  @import './map.css';

  /* 선택된 카드 스타일 */
  .selected-card-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .selected-card-img {
    width: 80px;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .selected-card-info {
    display: flex;
    flex-direction: column;
  }
  .card-name {
    font-weight: bold;
    font-size: 1.1rem;
  }
  .card-category {
    font-size: 0.9rem;
    color: gray;
  }
  </style>
