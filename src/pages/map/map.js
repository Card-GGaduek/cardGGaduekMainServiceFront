import { ref, onMounted, onUnmounted, nextTick,computed } from 'vue';
import axios from 'axios';

import { cat, store } from 'fontawesome';
import { useRoute, useRouter } from 'vue-router';
import memberApi from '@/api/memberApi';


export function useMap(mapDiv) {
  const map = ref(null);
  const markers = ref([]);
  const currentLocationMarker = ref(null);
  const watchId = ref(null);

  const keyword = ref('');
  const selectedCardCategory = ref('');
  const selectedMerchant = ref(null);

  const route = useRoute();
  const router = useRouter();
  const selectedCard = ref(null);
  const mapMarkers = ref([]);

  const myCards = ref([]); // 외부 API로 가져올 카드 리스트
  const cardDetailsMap = ref({}); // 카드 ID별 상세 정보 저장용

  // App.vue 검색 관련 추가
  const isMapReady = ref(false);
  const mapReadyCallbacks = ref([]);
  //

  const categoryColorMap = {
    COFFEE_SHOP: {
      label: '커피전문점',
      color: '#8B4513', // 갈색
    },
    CONVENIENCE_STORE: {
      label: '편의점',
      color: '#32CD32', // 연두색
    },
    MOVIE_THEATER: {
      label: '영화관',
      color: '#8A2BE2', // 보라색
    },
    RESTAURANT: {
      label: '음식점',
      color: '#FF6347', // 토마토색
    },
    GAS_STATION: {
      label: '주유소',
      color: '#FFD700', // 금색
    },
    THEME_PARK: {
      label: '놀이공원',
      color: '#00CED1', // 청록색
    },
    HOTEL: {
      label: '호텔',
      color: '#4169E1', // 로얄블루
    },
  };

  const categoryLabel = computed(() => {
    if (!selectedMerchant.value?.primaryType) return '';
    const key = selectedMerchant.value.primaryType.toUpperCase();
    return categoryColorMap[key]?.label || selectedMerchant.value.primaryType;
  });
  

  
  

  onMounted(async () => {
    await nextTick();
    initMap();
    moveToCurrentLocation();
    await loadMyCards(1); // 예시: memberId = 1
  });

  onUnmounted(() => {
    if (watchId.value) {
      navigator.geolocation.clearWatch(watchId.value);
    }

    // App.vue 검색 관련 추가
    mapReadyCallbacks.value = [];
    //
  });

  const initMap = () => {
    if (!mapDiv.value) {
      console.warn('mapDiv is not ready yet.');
      return;
    }
    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 15,
      minZoom: 6,
    };
    map.value = new window.naver.maps.Map(mapDiv.value, mapOptions);

    // App.vue 검색 관련 추가
    window.naver.maps.Event.addListener(map.value, 'idle', () => {
      if (!isMapReady.value) {
        isMapReady.value = true;

        mapReadyCallbacks.value.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error('지도 준비 콜백 실행 중 오류: ', error);
          }
        });

        mapReadyCallbacks.value = [];
      }
    });
    //
  };

  // App.vue 검색 관련 추가
  const onMapReady = (callback) => {
    if (isMapReady.value) {
      callback();
    } else {
      mapReadyCallbacks.value.push(callback);
    }
  };
  //

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('현재 위치를 사용할 수 없습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location = new window.naver.maps.LatLng(lat, lng);
        map.value.setCenter(location);

        if (currentLocationMarker.value) {
          currentLocationMarker.value.setMap(null);
        }

        currentLocationMarker.value = new window.naver.maps.Marker({
          position: location,
          map: map.value,
          icon: {
            content: `
              <div class="animated-location-marker">
                <div class="marker-core"></div>
                <div class="marker-wave"></div>
              </div>
            `,
          },
        });
      },
      (error) => {
        alert('위치 정보를 가져올 수 없습니다.');
        console.error('Geolocation error:', error);
      }
    );
  };

  // 1)키워드 검색
  const handleSearch = async (isAppend = false) => {
    if (!map.value) return;


    
    markers.value.forEach((marker) => marker.setMap(null));
    markers.value = [];
    

    if (!keyword.value.trim()) {
      console.warn('검색어가 비어 있습니다. 검색을 실행하지 않습니다.');
      return;
    }

    const center = map.value.getCenter();
    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const requestBody = {
      textQuery: keyword.value,
      languageCode: 'ko',
      locationRestriction: {
        rectangle: {
          low: {
            latitude: sw.y,
            longitude: sw.x,
          },
          high: {
            latitude: ne.y,
            longitude: ne.x,
          },
        },
      },
    };

    console.log('선택된 카드 category:', selectedCardCategory.value);
    const mappedCategory =
      categoryColorMap[selectedCardCategory.value] || selectedCardCategory.value;
    console.log('가맹점 검색 요청:', requestBody);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/place',
        requestBody
      );
      const places = response.data?.data?.places || [];

      if (places.length === 0) {
        console.warn('검색된 매장이 없습니다.');
      }

      await places.forEach(createMarker);
    } catch (error) {
      console.error('가맹점 검색에 실패했습니다:', error);
    }
  };

  // 2) 카드 혜택 카테고리 검색
  // 2-1) 누적검색 메소드
  const searchStoresByCategory = async (category, isAppend = false) => {
    if (!map.value) return;

    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const requestBody = {
      textQuery: category,
      languageCode: 'ko',
      locationRestriction: {
        rectangle: {
          low: {
            latitude: sw.y,
            longitude: sw.x,
          },
          high: {
            latitude: ne.y,
            longitude: ne.x,
          },
        },
      },
  };
  
  try {
    const response = await axios.post(
     'http://localhost:8080/api/place',
     requestBody
   );
   const places = response.data?.data?.places || [];

   places.forEach(createMarker);
   if (places.length === 0) {
    console.warn('카테고리 검색 결과가 없습니다:', category);
  }

 } catch(error) {
  console.error('카테고리 검색 실패:', error);
  }
};

  // 2-2)카드 클릭 시 카테고리 해당 매장 검색
const handleCardClick = async (cardId) => {
  try {
    const matchedCard = myCards.value.find(c => c.cardId === cardId);
    if (!matchedCard) return;

    const isAlreadySelected = selectedCard.value?.cardId === cardId;

    // 카드 바꾼다면 기존 마커 제거
    markers.value.forEach((marker) => marker.setMap(null));
    markers.value = [];

    // 이미 선택된 카드라면 선택 해제
    if (isAlreadySelected) {
      selectedCard.value = null;
      selectedCardCategory.value = '';
      router.replace({ query: {} }); // URL 쿼리 초기화
    } else {
        // 선택된 카드
        selectedCard.value = matchedCard;

        // 해당 카드의 카테고리 배열로 매장 검색 실행
        if (matchedCard.storeCategories && matchedCard.storeCategories.length > 0) {
        for (const category of matchedCard.storeCategories) 
        await searchStoresByCategory(category,true); // 누적 모드
                }

        // URL 쿼리 갱신(선택된 카드 상태 반영)
        router.replace({
        query: {
        ...router.query,
        cardId,
          },
      })
    }

   
  
    } catch (error) {
    console.error('카드 상세 정보를 불러오지 못했습니다:', error);
      }
  };


  


  // 내 카드 목록 불러오기
  const loadMyCards = async (memberId) => {
    try {
      const result = await memberApi.getMyCard();
      console.log('내 카드 목록:', result);

      const cardDetailMap = {};
      // 카드 상세정보 맵핑
      for (const card of result) {
        cardDetailMap[card.cardId] = card;
      }

      // 카드 리스트
      myCards.value = result.map((card) => ({
        cardId: card.cardId,
        cardNumber: card.cardNumber,
        cardProductId: card.cardProductId,
        cardProductName: card.cardProductName,
        image: card.cardImageUrl,
        requiredAmount: card.requiredMonthlyAmount,
        storeCategories: [
          ...new Set(card.storeBenefitList.map((b) => b.storeCategory)),
        ],
      }));

      //상세 정보 맵에 저장
      cardDetailsMap.value = cardDetailMap;

      // 쿼리에서 cardId 받아서 선택 카드 세팅
      const selectedId = Number(route.query.cardId);
      if (!selectedId) return;

      const matchedCard = myCards.value.find(
        (card) => card.cardId === selectedId
      );

      if (matchedCard) {
        const detail = cardDetailsMap.value[selectedId];
        selectedCardCategory.value =
          detail?.storeBenefitList?.[0]?.storeCategory || '';
        selectedCard.value = {
          ...matchedCard,
          ...detail,
        };

        router.replace({
          query: {
            ...route.query,
            cardId: matchedCard.cardId,
          },
        });
      }
    } catch (error) {
      console.error('카드 목록을 불러오는 데 실패했습니다:', error);
    }
  };



  // 검색 마커 생성
  const createMarker = async (place) => {
    const position = new window.naver.maps.LatLng(
      place.locationDTO.latitude,
      place.locationDTO.longitude
    );

    // 마커 색상
    const typeKey = place.primaryType?.toUpperCase();
    const markerColor = categoryColorMap[typeKey]?.color || '#888888';
    

    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: {
        content: `<div style=\"background-color: ${markerColor}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\"></div>`,
        anchor: new window.naver.maps.Point(11, 11),
      },
    });

    window.naver.maps.Event.addListener(marker, 'click', () => {
      onMarkerClick({
        name: place.name,
        primaryType: place.primaryType,
        location: {
          latitude: place.locationDTO.latitude,
          longitude: place.locationDTO.longitude,
        },
      });
    });

    markers.value.push(marker);
  };

  const getStoreBenefits = async () => {
    try {
      // const response = await axios.get(`http://localhost:8080/api/card/my`);
      const result = await memberApi.getMyCard();
      return result;
      // return response.data.data || [];
    } catch (error) {
      // console.error("가맹점 혜택 조회에 실패했습니다:", error);
      // return [];
      alert(error.message);
    }
  };

  // 마커 클릭
  const onMarkerClick = async (place) => {
    // const memberId = 6;
    const allCards = await getStoreBenefits();

    // 카드별 혜택을 펼쳐서 cardName 추가
    const allBenefits = allCards.flatMap((card) =>
      card.storeBenefitList.map((benefit) => ({
        ...benefit,
        cardName: card.cardProductName, // 주입!
        cardImageUrl : card.cardImageUrl
      }))
    );

    // 매장 이름 포함 필터
    const matchedBenefits = allBenefits.filter((b) =>
      place.name.includes(b.storeName)
    );

    // 선택된 카드가 있으면 카드명 기준으로도 필터링
    const filteredBenefits = selectedCard.value
      ? matchedBenefits.filter(
          (b) => b.cardName === selectedCard.value.cardProductName
        )
      : matchedBenefits;

    selectedMerchant.value = {
      name: place.name,
      primaryType: place.primaryType,
      location: place.location,
      benefits: filteredBenefits,
    };
  };

  

  return {
    map,
    mapDiv,
    markers,
    currentLocationMarker,
    watchId,
    keyword,
    selectedCardCategory,
    selectedMerchant,
    myCards,
    selectedCard,
    mapMarkers,
    isMapReady,
    onMapReady,
    categoryColorMap,
    categoryLabel,
    handleSearch,
    useRoute,
    moveToCurrentLocation,
    initMap,
    loadMyCards,
    searchStoresByCategory,
    handleCardClick
  };
}
