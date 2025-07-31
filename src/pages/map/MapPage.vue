<template>
  <div class="map-container">
    <div ref="mapDiv" class="map-view"></div>

    <!-- 검색 및 필터 UI -->
    <div class="controls-container">
      <div class="controls-box">
        
        <div class="search-bar">
          <input 
            type="text" 
            v-model="keyword"
            @keyup.enter="updateMarkers"
            placeholder="가맹점 이름 검색" 
            class="search-input"
          />
          <button @click="updateMarkers" class="search-button">
            검색
          </button>
        </div>

        <!-- 카드 이미지 필터 UI -->
        <div class="filter-section">
            <div class="card-filter-buttons">
              <div
                  v-for="card in myCards"
                  :key="card.id"
                  @click="filterByCategory(card.category)"
                  class="card-image-wrapper"
                  :class="{ 'active': selectedCardCategory === card.category }"
              > 
                <img :src="card.image" :alt="card.name" class="card-image" />
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- 하단 상세 정보 시트 -->
    <transition name="bottom-sheet">
      <div v-if="selectedMerchant" class="bottom-sheet-container">
        <div class="bottom-sheet-content">
          <button @click="selectedMerchant = null" class="close-button">
            &times;
          </button>
          <h2 class="merchant-name">{{ selectedMerchant.name }}</h2>
          <p class="merchant-category">{{ selectedMerchant.category }}</p>
          
          <div class="benefits-list">
            <h3 class="benefits-title">받을 수 있는 혜택</h3>
            <div v-for="benefit in selectedMerchant.benefits" :key="benefit.id" 
                 class="benefit-item" :class="{ 'primary': benefit.isPrimary }">
              <p class="benefit-desc">{{ benefit.description }}</p>
              <p class="benefit-card">{{ benefit.cardName }}</p>
            </div>
          </div>
          
          <button class="navigator-button">
            🥇 페이 내비게이터 실행하기
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ShinhanCard from '@/assets/images/cards/shinhandeepdream.png'
import HyundaiZero from '@/assets/images/cards/hyundaizero.png'
import KBTantandaero from '@/assets/images/cards/kb_tantandaero.png'

// 마커 관련 상태
const mapInstance = ref(null);
const markers = ref([]);
const selectedCardIds = ref([]);
const keyword = ref('');
const mapDiv = ref(null);
const selectedMerchant = ref(null);
const selectedCardCategory = ref('');

// 사용자 카드와 검색
const myCards = ref([
  { id: 1, name: '신한 Deep Dream', category: 'coffee_shop', color: '#00469B' , image: ShinhanCard },
  { id: 2, name: '현대 Zero', category: 'convenience_store', color: '#1E1E1E' , image: HyundaiZero },
  { id: 3, name: '국민 탄탄대로', category: 'movie_theater', color: '#6A483C' , image: KBTantandaero }
])


const updateMarkers = async () => {
  if (!keyword.value) {
    return;
  }
  const lat = 37.549376
  const lng = 127.081871

  const res = await axios.get('http://localhost:8080/api/place', {
    params: {
      name: keyword.value,
      latitude: lat,
      longitude: lng
    }
  })

  const places = res.data?.data?.places || [] 

  // 마커 초기화
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  // 마커 그리기
  places.forEach((place) => {
    // 필터링된 카테고리와 일치하는 경우만 마커 표시
    if (selectedCardCategory.value && place.primaryType !== selectedCardCategory.value) return

    const position = new window.naver.maps.LatLng(
      place.location.latitude,
      place.location.longitude
    )

    const markerColor = myCards.value.find(c => c.category === place.primaryType)?.color || '#999'

    const marker = new window.naver.maps.Marker({
      position,
      map: mapInstance.value,
      icon: {
        content: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
        anchor: new window.naver.maps.Point(10, 20)
      }
    })

    markers.value.push(marker)
    window.naver.maps.Event.addListener(marker, 'click', () => {
      selectedMerchant.value = place;
    });
  })
}

const toggleCardFilter = (cardId) => {
  const index = selectedCardIds.value.indexOf(cardId);
  if (index === -1) {
    // 장바구니에 없으면 추가
    selectedCardIds.value.push(cardId);
  } else {
    // 이미 장바구니에 있으면 제거
    selectedCardIds.value.splice(index, 1);
  }
  // 장바구니가 변경되었으니 지도에 표시를 업데이트
  updateMarkers();
};

const filterByCategory = (category) => {
  // 클릭한 카드의 카테고리로 값을 변경
  selectedCardCategory.value = category;
  
  // 변경된 카테고리로 마커를 다시 그림
  updateMarkers();
};

const initMap = () => {
  mapInstance.value = new window.naver.maps.Map(mapDiv.value, {
    center: new window.naver.maps.LatLng(37.549376, 127.081871),
    zoom: 15
  })

  updateMarkers()
}

onMounted(() => {
  const check = setInterval(() => {
    if (window.naver && window.naver.maps) {
      clearInterval(check)
      initMap()
    }
  }, 100)
})
</script>

<style scoped>
/* 전체 컨테이너 */
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-view {
  width: 100%;
  height: 1000px;
}

/* 지도 위 컨트롤 UI */
.controls-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.controls-box {
  background-color: white;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

/* 검색창 */
.search-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex-grow: 1;
  font-size: 1rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-right: 0.5rem;
  outline-color: #3b82f6;
}

.search-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}
.search-button:hover {
  background-color: #2563eb;
}

/* 카드 이미지 필터 스타일 */
.filter-section {
    padding-top: 0.5rem;
}

.card-filter-buttons {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0.25rem;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.card-filter-buttons::-webkit-scrollbar {
  display: none;
}


.card-image-wrapper {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid transparent;
  flex-shrink: 0;
}

.card-image-wrapper.active {
  border-color: #3b82f6;
  transform: scale(1.05) translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-image {
  display: block;
  width: 100px;
  height: auto;
  border-radius: 5px;
}

/* 하단 시트 스타일 (이전과 동일) */
.bottom-sheet-container { position: fixed; bottom: 70px; left: 0; right: 0; z-index: 1020; }
.bottom-sheet-content { background-color: white; border-top-left-radius: 1rem; border-top-right-radius: 1rem; box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15); padding: 1.5rem; max-height: calc(100vh - 250px); overflow-y: auto; }
.close-button { position: absolute; top: 1rem; right: 1rem; font-size: 1.5rem; color: #6b7280; background: none; border: none; cursor: pointer; }
.merchant-name { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem; }
.merchant-category { color: #6b7280; margin-bottom: 1rem; }
.benefits-list { margin-bottom: 1.5rem; }
.benefits-title { font-size: 1.125rem; font-weight: bold; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 0.75rem; }
.benefit-item { padding: 0.75rem; border-radius: 0.5rem; background-color: #f3f4f6; margin-bottom: 0.5rem; }
.benefit-item.primary { background-color: #eff6ff; border-left: 4px solid #3b82f6; }
.benefit-desc { font-weight: bold; color: #1d4ed8; }
.benefit-card { font-size: 0.875rem; color: #4b5563; }
.navigator-button { width: 100%; background: linear-gradient(to right, #3b82f6, #6366f1); color: white; font-weight: bold; padding: 0.75rem; border-radius: 0.5rem; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
.navigator-button:hover { transform: scale(1.02); }
.bottom-sheet-enter-active, .bottom-sheet-leave-active { transition: transform 0.3s ease; }
.bottom-sheet-enter-from, .bottom-sheet-leave-to { transform: translateY(100%); }
</style>