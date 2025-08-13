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

  /* 25.08.12 추가 */
  // 카드 검색 로직 분리 
  const topSelectedCard = ref(null); // 상단 선택 카드 (카테고리 검색용)
  const bottomSelectedCard = ref(null); // 하단 선택 카드 (매장 검색용)

  // 상단 드롭다운 "선택 카드의 혜택 카테고리만 적용"
  // const topFilteredCategories = computed(() => {
  //   if(!topSelectedCard.value){
  //     alert('카드를 먼저 선택해주세요.');
  //     return [];
  //   }
  //   if(!topSelectedCard.value.storeCategories?.length) {
  //     alert('카테고리를 선택해주세요.');
  //     return [];
  //   }
  //   return allCategories.f
  // })

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

  // 08.12 변경: 카테고리 정규화
  // brands/*.png 를 빌드 시 모두 불러와 slug(파일명) -> URL 맵을 만든다
const iconModules = import.meta.glob('../../assets/brands/*.png', {
  eager: true,
  import: 'default', // 각 png의 번들 URL 문자열을 바로 받음
});
const BRAND_ICON_MAP = {};
for (const [path, url] of Object.entries(iconModules)) {
  const slug = path.split('/').pop().replace(/\.png$/i, '').toLowerCase(); // starbucks
  BRAND_ICON_MAP[slug] = url; // '/assets/starbucks.abc123.png'
}
  // [2] 한글/영문 혼용 브랜드명을 파일명 슬러그로 변환
  // [map.js] brandSlug 교체
function brandSlug(name = '') {
  // 1) 정규화 (brandSlug 내부에서 자체 정규화)
  const s = String(name)
    .normalize('NFKC').toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .replace(/주유소|지점|점|본점|센터|몰|백화점|마트|스토어/g, '')
    .replace(/[·⋅•･・]/g, '')
    .replace(/&/g, 'and')
    .replace(/-|_/g, '')
    .replace(/[^\p{Letter}\p{Number}]/gu, '');

  // 2) 완전일치 별칭 (값은 반드시 소문자 파일명과 동일)
  const ALIAS_EQ = {
    '스타벅스': 'starbucks',
    '투썸플레이스': 'twosomeplace',
    '폴바셋': 'paulbassett',
    '커피빈': 'coffeebean',
    '이디야': 'ediya',
    '미니스톱': 'ministop',
    '이24': 'emart24',
    '씨유': 'cu',
    '세븐일레븐': '7eleven',
    '메가박스': 'megabox',
    '롯데시네마': 'lottecinema',
    '씨지브이': 'cgv',
    '지에스칼텍스': 'gscaltex',
    '지에스25': 'gs25',
    '에스케이주유소': 'sk',
    '현대오일뱅크': 'hyundaioil',
    '에스오일': 'soil',
    '롯데리아': 'lotteria',
    '맥도날드': 'macdonald',   
    'kfc': 'kfc',
    '버거킹': 'buggerking',
    '아웃백스테이크하우스': 'outback',
    '애슐리': 'ashley',
    '애슐리퀸즈': 'ashleyqueens',
    '롯데호텔': 'lottehotel',
  };
  if (ALIAS_EQ[s]) return ALIAS_EQ[s];

  // 3) 부분포함 별칭 (브랜드+지점명 대응)
  const CONTAINS = [
    ['스타벅스', 'starbucks'],
    ['CU', 'cu'],
    ['미니스톱', 'ministop'],
    ['투썸', 'twosomeplace'],
    ['폴바셋', 'paulbassett'],
    ['커피빈', 'coffeebean'],
    ['이디야', 'ediya'],
    ['세븐일레븐', '7eleven'],
    ['이24', 'emart24'],
    ['메가박스', 'megabox'],
    ['롯데시네마', 'lotte'],
    ['cgv', 'cgv'],
    ['gs칼텍스', 'gscaltex'],
    ['gs25', 'gs25'],
    ['sk주유소', 'sk'],
    ['sk', 'sk'],
    ['현대오일뱅크', 'hyundaioil'],
    ['s-oil', 'soil'],
    ['에스오일', 'soil'],
    ['버거킹', 'buggerking'],
    ['맥도날드', 'macdonald'],
    ['롯데리아', 'lotteria'],
    ['kfc', 'kfc'],
    ['아웃백스테이크하우스', 'outback'],
    ['애슐리', 'ashley'],
    ['애슐리퀸즈', 'ashleyqueens'],
    ['롯데호텔', 'lottehotel'],
  ];
  for (const [needle, slug] of CONTAINS) {
    const n = needle
      .normalize('NFKC').toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\p{Letter}\p{Number}]/gu, '');
    if (s.includes(n)) return slug;
  }

  // 4) 아무 매칭도 없으면 정규화된 s(소문자) 반환 → 파일명이 그대로면 잡힙니다.
  return s;
}
  // [3] place에서 로고 URL을 찾아오는 규칙
//  - 1순위: place.benefits[0].storeName
//  - 2순위: 모든 benefit의 brand 후보 중 place.name과 가장 유사한 것
//  - 3순위: place.name 자체로 slug 추출
function resolveBrandIcon(place) {
  const cand = [];

  // benefits가 있으면 우선 사용
  if (Array.isArray(place?.benefits) && place.benefits.length) {
    for (const b of place.benefits) {
      if (b?.storeName) cand.push(brandSlug(b.storeName));
    }
  }
  
  // place.name도 후보에 추가
  if (place?.name) cand.push(brandSlug(place.name));
  
  // 후보 중 첫 번째 매칭되는 아이콘 반환
  for (const key of cand) {
    if (BRAND_ICON_MAP[key]) return BRAND_ICON_MAP[key];
    else{
      console.warn(`브랜드 아이콘 없음: ${key}`);
      console.warn(`대상 place:`, place);
    }
  }
  return null; // 없으면 컬러 점 마커로 폴백
}

// [4] 마커 HTML 생성기: 원형 테두리 안에 PNG 표시
function buildBrandMarkerHTML(imgUrl) {
  // 30x30 컨테이너, 내부 이미지 24x24
  return `
    <div style="
      width:30px;height:30px;border-radius:50%;
      background:#fff;display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.2); border:2px solid #fff;
    ">
      <img src="${imgUrl}" alt="brand" style="
        width:24px;height:24px;object-fit:contain; image-rendering:auto;
      " />
    </div>
  `;
}

  const CATEGORY_CANON = {
    // 카페
    'cafe': 'COFFEE_SHOP',
    'coffee_shop': 'COFFEE_SHOP',
  
    // 편의점
    'convenience_store': 'CONVENIENCE_STORE',
    'grocery_store': 'CONVENIENCE_STORE',
  
    // 영화관
    'movie_theater': 'MOVIE_THEATER',
  
    // 음식점
    'restaurant': 'RESTAURANT',
    'food': 'RESTAURANT',
    'food_court': 'RESTAURANT',
    'fast_food': 'RESTAURANT',
    'dining': 'RESTAURANT',
    'diner': 'RESTAURANT',
    'pub': 'RESTAURANT',
    'bar': 'RESTAURANT',
    'cafe_restaurant': 'RESTAURANT',
    'fast_food_restaurant': 'RESTAURANT',
    'buffet_restaurant': 'RESTAURANT',

    // 주유소
    'gas_station': 'GAS_STATION',
  
    // 놀이공원
    'amusement_park': 'THEME_PARK',
  
    // 호텔/숙소
    'lodging': 'HOTEL',
  };

  const toCanon = (s = '') => {
    const norm = String(s).trim().toLowerCase().replace(/[\s-]+/g, '_');
    return CATEGORY_CANON[norm] || norm.toUpperCase();
  };
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
    const key = toCanon(selectedMerchant.value.primaryType); // 08.12 변경
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
    console.log('selectedCardFull:', sc, detail);
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
    // const typeKey = toCanon(place.primaryType);
    // const markerColor = categoryColorMap[typeKey]?.color || '#888888';

    // 로고 아이콘 우선, 없으면 기존 색 점 마커 폴백
      const iconUrl = resolveBrandIcon(place);
      let iconOpt;
      
      if (iconUrl) {
        iconOpt = {
          content: buildBrandMarkerHTML(iconUrl),
          anchor: new window.naver.maps.Point(15, 15),
        };
      } else {
        const typeKey = toCanon(place.primaryType);
        const markerColor = categoryColorMap[typeKey]?.color || '#888888';
        iconOpt = {
          content: `<div style="background-color:${markerColor};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.2);"></div>`,
          anchor: new window.naver.maps.Point(11, 11),
        };
      }

    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: 
      // {
      //   content: `<div style="background-color:${markerColor};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.2);"></div>`,
      //   anchor: new window.naver.maps.Point(11, 11),
      // },
      iconOpt,
      clickable: true,
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

    // 08.12 추가
    const sc = selectedCardFull();
    if (!sc) {
    alert('먼저 카드를 선택해주세요.');
    return;
    }

    const canon = toCanon(category);

     // 1) 이 카드의 혜택 중, 선택 카테고리와 일치하며 매장명이 있는 것만 추출
    const brandNames = [
    ...new Set(
      (sc.storeBenefitList || [])
        .filter(b => toCanon(b.storeCategory) === canon && (b.storeName || '').trim())
        .map(b => b.storeName.trim())
      ),
    ];

    if (!brandNames.length) {
    console.warn('선택 카테고리에 브랜드형 혜택이 없습니다.');
    showNoBenefitMessage();
    return;
    }

    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    // 08.12 추가
    const requests = brandNames.map((brand) => {
      const requestBody = {
        textQuery: brand,
        languageCode: 'ko',
        locationRestriction: {
          rectangle: {
            low: { latitude: sw.y, longitude: sw.x },
            high: { latitude: ne.y, longitude: ne.x },
          },
        },
      };
      return axios.post('http://localhost:8080/api/place', requestBody)
      .then(res => ({ brand, places: res.data?.data?.places || [] }))
      .catch(() => ({ brand, places: [] }));
      });

    try {
      const results = await Promise.all(requests);

      // 08.12 추가
      // 4) 장소 합치기(중복 제거) + 이 카드의 해당 브랜드 혜택만 달아줌
      const allCards = await getStoreBenefits();
      const allBenefits = cardsToBenefits(allCards);
      const norm = (s = '') => normalizeName(s);

      const seen = new Set();
      const mergedPlaces = [];

      for (const { brand, places } of results) {
      const brandKey = norm(brand);

      for (const place of places) {
        if (toCanon(place.primaryType) !== canon) continue;
        // 브랜드명 매칭(양방향 포함)
        const placeKey = norm(place.name || '');
        if (!(placeKey.includes(brandKey) || brandKey.includes(placeKey))) continue;

        // 중복 제거(좌표 기준)
        const sig = `${place.locationDTO?.latitude}|${place.locationDTO?.longitude}`;
        if (seen.has(sig)) continue;
        seen.add(sig);

        // 이 카드 + 이 카테고리 + 이 브랜드의 혜택만 부여
        const benefits = (sc.storeBenefitList || []).filter(
          b =>
            toCanon(b.storeCategory) === canon &&
            norm(b.storeName) && (placeKey.includes(norm(b.storeName)) || norm(b.storeName).includes(placeKey)) &&
            b.cardProductId === sc.cardProductId
        );

        place.benefits = benefits;
        mergedPlaces.push(place);
      }
    }

    if (!mergedPlaces.length) return;
    mergedPlaces.forEach(createMarker);
    } catch (error) {
      console.error('카테고리/브랜드 검색 실패:', error);
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
          ...new Set(
            (card.storeBenefitList || []).map((b) => toCanon(b.storeCategory))
          ),
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
