// src/pages/map/map.js
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import memberApi from '@/api/memberApi';

export function useMap(mapDiv) {
  const map = ref(null);
  const markers = ref([]);
  const currentLocationMarker = ref(null);
  const watchId = ref(null);

  const route = useRoute();
  const router = useRouter();

  const keyword = ref(route.query.keyword || '');
  const selectedCard = ref(null);
  const selectedCardCategory = ref('');
  const selectedMerchant = ref(null);
  const selectedStoreName = ref('');

  const mapMarkers = ref([]);
  const noBenefitAlert = ref(false);
  const hasShownAlert = ref(false);
  const isSearching = ref(false);

  const myCards = ref([]); // 얕은 리스트(UI용)
  const cardDetailsMap = ref({}); // 상세 캐시(혜택 포함)

  // 지도 Ready 콜백
  const isMapReady = ref(false);
  const mapReadyCallbacks = ref([]);

  // 색상/라벨 매핑
  const categoryColorMap = {
    COFFEE_SHOP: { label: '카페', color: '#8B4513' },
    CONVENIENCE_STORE: { label: '편의점', color: '#32CD32' },
    MOVIE_THEATER: { label: '영화관', color: '#8A2BE2' },
    RESTAURANT: { label: '음식점', color: '#FF6347' },
    GAS_STATION: { label: '주유소', color: '#FFD700' },
    THEME_PARK: { label: '놀이공원', color: '#00CED1' },
    HOTEL: { label: '호텔', color: '#4169E1' },
  };

  const categoryLabel = computed(() => {
    if (!selectedMerchant.value?.primaryType) return '';
    const key = selectedMerchant.value.primaryType.toUpperCase();
    return categoryColorMap[key]?.label || selectedMerchant.value.primaryType;
  });

  const iconMap = {
    COFFEE_SHOP: 'bi-cup-hot',
    CAFE: 'bi-cup-hot',
    CONVENIENCE_STORE: 'bi-shop',
    MOVIE_THEATER: 'bi-film',
    RESTAURANT: 'bi-egg-fried',
    GAS_STATION: 'bi-fuel-pump',
    THEME_PARK: 'bi-tree',
    HOTEL: 'bi-building',
  };
  
  const categoriesForUI = computed(() =>
    Object.entries(categoryColorMap).map(([key, v]) => ({
      key,                         // [map.js 연결] searchStoresByCategory(key)로 전달되는 키
      label: v.label,              // 표기 라벨
      icon: iconMap[key] || null,  // 아이콘(선택)
    }))
  );

  const showNoBenefitMessage = () => {
    if (hasShownAlert.value) return;
    noBenefitAlert.value = true;
    hasShownAlert.value = true;
    setTimeout(() => {
      noBenefitAlert.value = false;
    }, 2000);
  };

  // ---- 혜택 캐시 & 유틸 ----
  const benefitsCache = ref(null); // memberApi.getMyCard() 결과 캐시

  const cardsToBenefits = (cards) =>
    cards.flatMap((card) =>
      (card.storeBenefitList || []).map((benefit) => ({
        ...benefit,
        cardName: card.cardProductName,
        cardImageUrl: card.cardImageUrl,
        cardProductId: card.cardProductId,
      }))
    );

  // selectedCard가 얕게 세팅된 경우 상세와 머지해서 반환
  const selectedCardFull = () => {
    const sc = selectedCard.value;
    if (!sc) return null;
    const detail = cardDetailsMap.value?.[sc.cardId];
    return detail ? { ...sc, ...detail } : sc;
  };

  // 지도 초기화
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

    window.naver.maps.Event.addListener(map.value, 'idle', () => {
      if (!isMapReady.value) {
        isMapReady.value = true;
        mapReadyCallbacks.value.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            console.error(e);
          }
        });
        mapReadyCallbacks.value = [];
      }
    });
  };

  const onMapReady = (callback) => {
    if (isMapReady.value) callback();
    else mapReadyCallbacks.value.push(callback);
  };

  // 현재 위치로 이동
  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('현재 위치를 사용할 수 없습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const loc = new window.naver.maps.LatLng(lat, lng);
        map.value.setCenter(loc);

        if (currentLocationMarker.value)
          currentLocationMarker.value.setMap(null);
        currentLocationMarker.value = new window.naver.maps.Marker({
          position: loc,
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

  // 카드 상세(혜택) 가져오기: 캐시 우선
  const getStoreBenefits = async () => {
    try {
      if (benefitsCache.value?.length) return benefitsCache.value;
      const cachedFromMap = Object.values(cardDetailsMap.value || {});
      if (cachedFromMap.length) {
        benefitsCache.value = cachedFromMap;
        return benefitsCache.value;
      }
      // 마지막 수단: 네트워크 1회
      const result = await memberApi.getMyCard();
      const mapObj = {};
      for (const card of result) mapObj[card.cardId] = card;
      cardDetailsMap.value = mapObj;
      benefitsCache.value = result;
      return benefitsCache.value;
    } catch (error) {
      alert(error.message);
    }
  };

  // 검색 마커 생성
  const createMarker = async (place) => {
    const position = new window.naver.maps.LatLng(
      place.locationDTO.latitude,
      place.locationDTO.longitude
    );
    const typeKey = place.primaryType?.toUpperCase();
    const markerColor = categoryColorMap[typeKey]?.color || '#888888';

    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: {
        content: `<div style="background-color:${markerColor};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.2);"></div>`,
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

  // 검색 마커 지우기 유틸
  const clearMarkers = () => {
    try {
      markers.value.forEach(m => m.setMap(null));
    } catch (e) {
      console.warn('clearMarkers error:', e);
    }
    markers.value = [];
  };

  // 1) 키워드 검색(누적 아님)
  const handleSearch = async () => {
    if (!map.value) return;

    // 초기화
    markers.value.forEach((m) => m.setMap(null));
    markers.value = [];

    if (!keyword.value.trim()) {
      console.warn('검색어가 비어 있습니다. 검색을 실행하지 않습니다.');
      return;
    }

    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const requestBody = {
      textQuery: keyword.value,
      languageCode: 'ko',
      locationRestriction: {
        rectangle: {
          low: { latitude: sw.y, longitude: sw.x },
          high: { latitude: ne.y, longitude: ne.x },
        },
      },
    };

    try {
      const response = await axios.post(
        'http://localhost:8080/api/place',
        requestBody
      );
      const places = response.data?.data?.places || [];
      if (!places.length) {
        console.warn('검색된 매장이 없습니다.');
        showNoBenefitMessage();
        return;
      }

      // 혜택 풀 준비(캐시)
      const allCards = await getStoreBenefits();
      const allBenefits = cardsToBenefits(allCards);
      const sc = selectedCardFull();

      const benefitPlaces = [];
      for (const place of places) {
        const matched = allBenefits.filter((b) =>
          place.name.includes(b.storeName)
        );
        const filtered = sc
          ? matched.filter((b) => b.cardProductId === sc.cardProductId)
          : matched;
        if (filtered.length) {
          place.benefits = filtered;
          benefitPlaces.push(place);
        }
      }

      if (!benefitPlaces.length) {
        showNoBenefitMessage();
        return;
      }
      benefitPlaces.forEach(createMarker);
    } catch (error) {
      console.error('가맹점 검색에 실패했습니다:', error);
    }
  };

  // 2) 카드 혜택 카테고리 검색(누적)
  const searchStoresByCategory = async (category) => {
    if (!map.value) return;

    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const requestBody = {
      textQuery: category,
      languageCode: 'ko',
      locationRestriction: {
        rectangle: {
          low: { latitude: sw.y, longitude: sw.x },
          high: { latitude: ne.y, longitude: ne.x },
        },
      },
    };

    try {
      const response = await axios.post(
        'http://localhost:8080/api/place',
        requestBody
      );
      const places = response.data?.data?.places || [];

      const allCards = await getStoreBenefits();
      const allBenefits = cardsToBenefits(allCards);
      const sc = selectedCardFull();

      const benefitPlaces = [];
      for (const place of places) {
        const matched = allBenefits.filter((b) =>
          place.name.includes(b.storeName)
        );
        const filtered = sc
          ? matched.filter((b) => b.cardProductId === sc.cardProductId)
          : matched;
        if (filtered.length) {
          place.benefits = filtered;
          benefitPlaces.push(place);
        }
      }

      if (!benefitPlaces.length) return;
      benefitPlaces.forEach(createMarker);
    } catch (error) {
      console.error('카테고리 검색 실패:', error);
    }
  };

  // 2-2) 카드 클릭 시: 카테고리 누적검색
  const handleCardClick = async (cardId,options = {}) => {
    const { autoSearch = true } = options;
    try {
      const matchedCard = myCards.value.find((c) => c.cardId === cardId);
      if (!matchedCard) return;

      const isAlreadySelected = selectedCard.value?.cardId === cardId;

      // 카드 바꾸면 기존 마커 제거
      markers.value.forEach((m) => m.setMap(null));
      markers.value = [];

      if (isAlreadySelected) {
        selectedCard.value = null;
        selectedCardCategory.value = '';
        router.replace({ query: {} });
        return;
      }

      isSearching.value = true;

      // 상세 머지
      if (!cardDetailsMap.value[cardId]) {
        // 캐시에 없다면 한 번 보충
        await getStoreBenefits();
      }
      const detail = cardDetailsMap.value?.[cardId];
      selectedCard.value = detail ? { ...matchedCard, ...detail } : matchedCard;

      // 카테고리 누적 검색
      if (autoSearch && matchedCard.storeCategories?.length) {
        for (const category of matchedCard.storeCategories) {
          await searchStoresByCategory(category);
        }
      }

      router.replace({ query: { ...route.query, cardId } });
    } catch (error) {
      console.error('카드 상세 정보를 불러오지 못했습니다:', error);
    } finally {
      isSearching.value = false; // 항상 꺼지도록
    }
  };

  // 3) 가맹점명 단일 검색
  // 매장명 정규화(공백/괄호/특수문자/지점표현/전각/기호 통일)
  const normalizeName = (s = '') => {
    return s
      .normalize('NFKC') // 전각 → 반각 등 정규화
      .toLowerCase()
      .replace(/\s+/g, '') // 모든 공백 제거
      .replace(/\(.*?\)|\[.*?\]/g, '') // ()/[] 안 내용 제거
      .replace(/지점|점|본점|센터|몰|백화점|마트|스토어/g, '') // 흔한 접미어 제거(필요시 추가)
      .replace(/&/g, 'and') // & → and
      .replace(/·|⋅|•|･|・/g, '') // 중점 기호류 제거
      .replace(/-|_/g, '') // 하이픈/언더바 제거
      .replace(/[^\p{Letter}\p{Number}]/gu, ''); // 문자/숫자 외 제거(유니코드)
  };

  // 3) 드롭다운 매장 선택 → 선택된 카드 혜택 가능한 곳만 표시(정규화 매칭)
  const searchByStoreName = async () => {
    const storeName = selectedStoreName.value?.trim();
    if (!storeName) {
      alert('가맹점을 선택해주세요.');
      return;
    }
    const sc = selectedCardFull();
    if (!sc) {
      alert('먼저 카드를 선택해주세요.');
      return;
    }
    if (!map.value) return;

    // 마커 초기화
    markers.value.forEach((m) => m.setMap(null));
    markers.value = [];

    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const requestBody = {
      textQuery: storeName,
      languageCode: 'ko',
      locationRestriction: {
        rectangle: {
          low: { latitude: sw.y, longitude: sw.x },
          high: { latitude: ne.y, longitude: ne.x },
        },
      },
    };

    try {
      // 1) 장소 후보
      const resp = await axios.post(
        'http://localhost:8080/api/place',
        requestBody
      );
      const places = resp.data?.data?.places || [];
      if (!places.length) {
        showNoBenefitMessage();
        return;
      }

      // 2) 혜택 풀(캐시) 준비
      const allCards = await getStoreBenefits();
      const allBenefits = cardsToBenefits(allCards);

      // 3) 정규화 키 준비
      const targetKey = normalizeName(storeName);

      // 4) 장소명 매칭 + 선택카드 필터
      const benefitPlaces = [];
      for (const place of places) {
        const placeKey = normalizeName(place.name);

        // 장소명 ↔ 혜택가맹점명 양방향 포함 매칭
        const matched = allBenefits.filter((b) => {
          const benKey = normalizeName(b.storeName);
          return (
            placeKey.includes(benKey) ||
            benKey.includes(placeKey) ||
            targetKey.includes(benKey) ||
            benKey.includes(targetKey)
          );
        });

        // 선택 카드로 한 번 더 필터 (ID 기준)
        const filtered = matched.filter(
          (b) => b.cardProductId === sc.cardProductId
        );

        if (filtered.length) {
          place.benefits = filtered;
          benefitPlaces.push(place);
        }
      }

      if (!benefitPlaces.length) {
        showNoBenefitMessage();
        return;
      }

      // 5) 마커 표시 + 첫 결과로 이동
      benefitPlaces.forEach(createMarker);
      const first = benefitPlaces[0];
      if (first?.locationDTO) {
        map.value.setCenter(
          new window.naver.maps.LatLng(
            first.locationDTO.latitude,
            first.locationDTO.longitude
          )
        );
      }
    } catch (e) {
      console.error('검색 실패:', e);
    }
  };

  // 내 카드 목록 불러오기(초기 1회)
  const loadMyCards = async () => {
    try {
      const result = await memberApi.getMyCard();
      // 상세 맵
      const detailMap = {};
      for (const card of result) detailMap[card.cardId] = card;
      cardDetailsMap.value = detailMap;

      // 얕은 리스트(UI)
      myCards.value = result.map((card) => ({
        cardId: card.cardId,
        cardNumber: card.cardNumber,
        cardProductId: card.cardProductId,
        cardProductName: card.cardProductName,
        image: card.cardImageUrl,
        requiredAmount: card.requiredMonthlyAmount,
        storeCategories: [
          ...new Set((card.storeBenefitList || []).map((b) => b.storeCategory)),
        ],
      }));

      // 혜택 캐시 채움
      benefitsCache.value = Object.values(detailMap);

      // 쿼리 cardId 있으면 자동 선택
      const selectedId = Number(route.query.cardId);
      if (!selectedId) return;
      const matchedCard = myCards.value.find((c) => c.cardId === selectedId);
      if (matchedCard) await handleCardClick(selectedId);
    } catch (error) {
      console.error('카드 목록을 불러오는 데 실패했습니다:', error);
    }
  };

  // 마커 클릭 → 상세 시트 데이터 구성
  const onMarkerClick = async (place) => {
    const allCards = await getStoreBenefits();
    const allBenefits = cardsToBenefits(allCards);

    const matchedBenefits = allBenefits.filter((b) =>
      place.name.includes(b.storeName)
    );
    const sc = selectedCardFull();
    const filteredBenefits = sc
      ? matchedBenefits.filter((b) => b.cardProductId === sc.cardProductId)
      : matchedBenefits;

    selectedMerchant.value = {
      name: place.name,
      primaryType: place.primaryType,
      location: place.location,
      benefits: filteredBenefits,
    };
  };

  onMounted(async () => {
    await nextTick();
    initMap();
    moveToCurrentLocation();
    await loadMyCards();
  });

  onUnmounted(() => {
    if (watchId.value) navigator.geolocation.clearWatch(watchId.value);
    mapReadyCallbacks.value = [];
  });

  return {
    // state
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
    route,
    categoryColorMap,
    categoryLabel,
    noBenefitAlert,
    selectedStoreName,
    isSearching,
    categoriesForUI,

    // methods
    initMap,
    onMapReady,
    loadMyCards,
    handleSearch,
    handleCardClick,
    searchStoresByCategory,
    searchByStoreName,
    moveToCurrentLocation,
    showNoBenefitMessage,
    clearMarkers,
  };
}
