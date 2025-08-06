import { ref, onMounted, onUnmounted, nextTick } from 'vue';
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
  };

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

  const handleSearch = async () => {
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

    const categoryMap = {
      coffee_shop: '커피전문점',
      convenience_store: '편의점',
      movie_theater: '영화관',
      restaurant: '음식점',
      gas_station: '주유소',
      theme_park: '놀이공원',
      hotel: '호텔',
    };

    const requestBody = {
      textQuery: keyword.value,
      languageCode: 'ko',
      locationBias: {
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
      categoryMap[selectedCardCategory.value] || selectedCardCategory.value;
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

      places.forEach(createMarker);
    } catch (error) {
      console.error('가맹점 검색에 실패했습니다:', error);
    }
  };

  const loadMyCards = async (memberId) => {
    try {
      const result = await memberApi.getMyCard();
      console.log('내 카드 목록:', result);

      const cardDetailMap = {};
      // 카드 상세정보 맵핑
      for (const card of result) {
        cardDetailMap[card.cardId] = card
      }

      // 카드 리스트
      myCards.value = result.map((card) => ({
        cardId: card.cardId,
        cardNumber: card.cardNumber,
        cardProductId: card.cardProductId,
        cardProductName: card.cardProductName,
        image: card.cardImageUrl,
        requiredAmount: card.requiredMonthlyAmount,
        storeCategories : [...new Set(
          card.storeBenefitList.map(b => b.storeCategory)
        )]
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
        selectedCardCategory.value = detail?.storeBenefitList?.[0]?.storeCategory || '';
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

  const loadCardBack = async (cardId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/main/card/${cardId}/back`
      );
      return response.data.data;
    } catch (error) {
      console.error(`카드 상세 정보(${cardId}) 불러오기 실패:`, error);
      return null;
    }
  };

  // 검색 마커 생성
  const createMarker = (place) => {
    const position = new window.naver.maps.LatLng(
      place.locationDTO.latitude,
      place.locationDTO.longitude
    );
    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: {
        content: `<div style=\"background-color: #ffcd39; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\"></div>`,
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

  const getStoreBenefits = async (memberId) => {
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

  // 카드 클릭으로 검색하는 마커
  const handleCardClick = async (cardId) => {
    try {
      // 카드 상세 정보 API 요청
      const response = await memberApi.getMyCard();
      const cardDetail = response.data.data;

      // 카드 정보 매핑
      const matchedCard = myCards.value.find((card) => card.cardId === cardId);
      if (!matchedCard) return;

      selectedCard.value = {
        ...matchedCard,
        ...cardDetail,
      };

      // storeCategory → 검색용 카테고리로 설정
      selectedCardCategory.value =
        cardDetail.benefits?.[0]?.storeCategory || '';

      // URL 쿼리 갱신
      router.replace({
        query: {
          ...route.query,
          cardId,
        },
      });

      // 검색 실행
      handleSearch();
    } catch (error) {
      console.error('카드 상세 정보를 불러오지 못했습니다:', error);
    }
  };

  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition = new window.naver.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          if (!currentLocationMarker.value) {
            currentLocationMarker.value = new window.naver.maps.Marker({
              position: newPosition,
              map: map.value,
              icon: {
                content: `<div style=\"width:20px;height:20px;background-color:#ffcd39;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.5);\"></div>`,
                anchor: new window.naver.maps.Point(10, 10),
              },
            });
            map.value.setCenter(newPosition);
            handleSearch();
          } else {
            currentLocationMarker.value.setPosition(newPosition);
          }
        },
        (error) => {
          console.error('위치 정보를 가져오는 데 실패했습니다:', error.message);
          handleSearch();
        }
      );
    } else {
      console.error('이 브라우저는 위치 정보를 지원하지 않습니다.');
      handleSearch();
    }
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
    handleSearch,
    useRoute,
    moveToCurrentLocation,
    initMap,
    loadMyCards,
  };
}
