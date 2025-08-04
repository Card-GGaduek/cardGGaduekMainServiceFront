<template>
  <div class="main-page">
    <MainHeader :showNotification="true" />

    <!-- 카드 스와이퍼 컴포넌트 -->
    <CardSwiper />

    <!-- 추천 카드 컴포넌트 -->
    <RecommendedCards />

    <!-- 월별 혜택 컴포넌트 -->
    <MonthlyBenefit />

    <!-- 실험실 페이지 이동 버튼 컴포넌트 -->
    <LabButton />

    <!-- 광고형배너 -->
    <AdBanner />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import MainHeader from '@/layout/MainHeader.vue';
import CardSwiper from '@/components/main/CardSwiper.vue';
import RecommendedCards from '@/components/main/RecommendedCards.vue';
import MonthlyBenefit from '@/components/main/MonthlyBenefit.vue';
import LabButton from '@/components/main/LabButton.vue';
import AdBanner from '@/components/main/AdBanner.vue';
import { getCardList, getCardBack } from '@/api/maincard';
import { useRouter } from 'vue-router';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/vue';

const cards = ref([]);
const activeIndex = ref(1); // 두 번째 카드부터 시작
const flippedCards = ref(new Set()); // 뒤집힌 카드들의 인덱스를 저장
const isSliding = ref(false); // 슬라이딩 중인지 확인
const cardBackData = ref({}); // 카드 뒷면 데이터 저장

const router = useRouter();

// 이용내역 조회 페이지로 이동
const goToAnalysis = () => {
  router.push({ name: 'Analysis' });
};

// 결제 페이지로 이동
const goToPayment = () => {
  router.push('/payment/qr');
};

const goToStoreList = (cardId) => {
  console.log('카드 ID:', cardId); // 디버깅용
  if (!cardId) {
    console.error('카드 ID가 없습니다.');
    return;
  }

  try {
    router.push({
      name: 'MapPage', // 또는 'MapPage' - 라우터 설정에 맞게
      query: { cardId: cardId },
    });
  } catch (error) {
    console.error('페이지 이동 실패:', error);
  }
};

const loadCards = async () => {
  try {
    const response = await getCardList(4);
    cards.value = response.data.data;
  } catch (err) {
    console.error('카드 리스트 로드 실패:', err);
  }
};

const maskCardNumber = (number) => {
  return number?.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const getCardBackInfo = (cardId) => {
  return cardBackData.value[cardId];
};

const onSlideChange = (swiper) => {
  // 슬라이딩 시작 시 애니메이션 비활성화
  isSliding.value = true;

  // 즉시 모든 카드를 앞면으로 되돌리기 (애니메이션 없이)
  flippedCards.value.clear();

  activeIndex.value = swiper.activeIndex;

  // 약간의 딜레이 후 애니메이션 다시 활성화
  setTimeout(() => {
    isSliding.value = false;
  }, 100);
};

const toggleCardFlip = async (index) => {
  // 활성 카드(가운데 카드)만 뒤집기 가능
  if (index === activeIndex.value) {
    if (flippedCards.value.has(index)) {
      flippedCards.value.delete(index);
    } else {
      // 카드 뒷면 데이터가 없으면 API 호출
      const cardId = cards.value[index].cardId;
      if (!cardBackData.value[cardId]) {
        try {
          const response = await getCardBack(cardId);
          cardBackData.value[cardId] = response.data.data;
        } catch (err) {
          console.error('카드 뒷면 데이터 로드 실패:', err);
          return;
        }
      }
      flippedCards.value.add(index);
    }
  }
};

onMounted(() => {
  loadCards();
});
</script>

<style scoped>
.main-page {
  width: 100%;
  overflow: hidden;
}
</style>
