<template>
  <div class="edit-page-wrapper">
    <SubHeader title="카드 편집하기" />
    <div class="edit-header">
      <!-- <h3 class="header-title">카드 편집하기</h3> -->
    </div>
    <div class="edit-page-scroll">
      <div class="edit-page">
        <div class="card-list" v-if="!loading">
          <div
            v-for="(card, index) in sortedCards"
            :key="card.cardId"
            class="card-item"
            :class="{ deleted: card.isDeleted }"
          >
            <!-- 카드 이미지 -->
            <div class="card-container">
              <img
                :src="card.cardImageUrl"
                :alt="card.cardProductName"
                class="card-image"
                :class="{ grayscale: card.isDeleted }"
              />
              <div v-if="card.isDeleted" class="deleted-overlay">
                <span>삭제된 카드</span>
              </div>
            </div>

            <!-- 카드 이미지 변경 버튼 -->
            <button
              @click="openImageModal(card)"
              class="change-image-btn"
              :disabled="card.isDeleted"
            >
              카드 이미지 변경
            </button>

            <!-- 카드 삭제 버튼 -->
            <button
              @click="deleteCard(card)"
              class="delete-btn"
              :disabled="card.isDeleted"
            >
              {{ card.isDeleted ? '삭제된 카드' : '- 카드 삭제' }}
            </button>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading">카드 정보를 불러오는 중...</div>

        <!-- 이미지 변경 모달 -->
        <div
          v-if="showImageModal"
          class="modal-overlay"
          @click="closeImageModal"
        >
          <div class="modal-content" @click.stop>
            <h3>카드 이미지 변경</h3>
            <div class="modal-buttons">
              <button
                @click="selectFromAlbum"
                class="modal-btn primary"
                :disabled="uploading"
              >
                {{ uploading ? '업로드 중...' : '앨범에서 이미지 선택' }}
              </button>
              <button
                @click="useDefaultImage"
                class="modal-btn secondary"
                :disabled="uploading"
              >
                기본 이미지로 변경
              </button>
              <button
                @click="closeImageModal"
                class="modal-btn cancel"
                :disabled="uploading"
              >
                취소
              </button>
            </div>
          </div>
        </div>

        <!-- 숨겨진 파일 입력 -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import SubHeader from '@/layout/SubHeader.vue';
import cardApi from '@/api/cardApi.js';

// 반응형 데이터
const cards = ref([]);
const loading = ref(true);
const uploading = ref(false);
const showImageModal = ref(false);
const selectedCard = ref(null);
const selectedCardIndex = ref(null);
const fileInput = ref(null);

// 카드 정보 로드
const loadCards = async () => {
  try {
    loading.value = true;
    const response = await cardApi.getCardFrontInfo();
    cards.value = response.data.map((card) => ({
      ...card,
      cardId: card.cardId ?? card.id,
      isDeleted: card.isValid === 0,
      originalImageUrl: card.cardImageUrl,
    }));
    console.log('cardApi.getCardFrontInfo 응답:', response.data);
  } catch (error) {
    console.error('카드 정보 로드 실패:', error);
    alert('카드 정보를 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// isValid 값에 따른 카드 정렬
const sortedCards = computed(() => {
  return [...cards.value].sort((a, b) => b.isValid - a.isValid);
});

// 카드 ID로 원본 배열에서 인덱스 찾기
const findCardIndexById = (cardId) => {
  return cards.value.findIndex((card) => card.cardId === cardId);
};

// 이미지 변경 모달 열기
const openImageModal = (card) => {
  if (card.isDeleted) return;
  selectedCard.value = card;
  showImageModal.value = true;
};

// 이미지 변경 모달 닫기
const closeImageModal = () => {
  showImageModal.value = false;
  selectedCard.value = null;
  uploading.value = false;
};

// 앨범에서 이미지 선택
const selectFromAlbum = () => {
  if (uploading.value) return;
  fileInput.value.click();
};

// 파일 선택 처리
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 체크
  if (file.size > 10 * 1024 * 1024) {
    alert('파일 크기는 10MB 이하여야 합니다.');
    event.target.value = '';
    return;
  }

  // 파일 형식 체크
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    event.target.value = '';
    return;
  }

  try {
    uploading.value = true;

    console.log('선택된 카드:', selectedCard.value);

    // 1. 백엔드에 이미지 파일 업로드 (S3에 저장 + URL 생성 + DB 저장)
    const response = await cardApi.updateCardImage(
      selectedCard.value.cardId,
      file // MultipartFile 전송
    );

    // 2. 응답받은 imageUrl로 카드 이미지 반영
    const newImageUrl = response.data.imageUrl;
    const cardIndex = findCardIndexById(selectedCard.value.cardId);
    if (cardIndex !== -1) {
      cards.value[cardIndex].cardImageUrl = newImageUrl;
    }

    closeImageModal();
    alert('카드 이미지가 변경되었습니다.');
  } catch (error) {
    console.error('이미지 변경 실패: ', error);
    alert('이미지 변경에 실패했습니다: ' + error.message);
  } finally {
    uploading.value = false;
    event.target.value = ''; // 파일 초기화
  }
};

// 기본 이미지로 변경
const useDefaultImage = async () => {
  if (uploading.value) return;

  try {
    uploading.value = true;

    // 1. 백엔드에 null을 보내서 custom_image_url을 초기화
    await cardApi.updateCardImage(selectedCard.value.cardId, null);

    // 2. 원본 이미지 URL로 되돌리기 (카드 상품의 기본 이미지)
    const cardIndex = findCardIndexById(selectedCard.value.cardId);
    if (cardIndex !== -1) {
      const card = cards.value[cardIndex];
      // 서버에서 다시 카드 정보를 가져와서 기본 이미지 URL 확인
      // or originalImageUrl 사용 (로드할 때 저장해둔 원본)
      card.cardImageUrl = card.originalImageUrl;
    }

    closeImageModal();
    alert('기본 이미지로 변경되었습니다.');
  } catch (error) {
    console.error('기본 이미지 변경 실패:', error);
    alert('기본 이미지 변경에 실패했습니다.');
  } finally {
    uploading.value = false;
  }
};

// 카드 삭제
const deleteCard = async (card) => {
  if (card.isDeleted) return;

  const confirmed = confirm('정말로 이 카드를 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    const success = await cardApi.deleteCard(card.cardId);
    if (success) {
      const cardIndex = findCardIndexById(card.cardId);
      if (cardIndex !== -1) {
        cards.value[cardIndex].isDeleted = true;
        cards.value[cardIndex].isValid = 0;
      }
      alert('카드가 삭제되었습니다.');
    }
  } catch (error) {
    console.error('카드 삭제 실패:', error);
    alert('카드 삭제에 실패했습니다.');
  }
};

// 컴포넌트 마운트 시 카드 정보 로드
onMounted(async () => {
  await loadCards();
});
</script>

<style scoped>
.edit-page-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.edit-page-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* NavBar 높이만큼 하단 여백 확보 */
  padding-bottom: 80px;
}

.edit-page {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  box-sizing: border-box;
  min-height: 100%;
}

/* Header */
.header-title {
  text-align: center;
  margin-top: 10px;
  padding-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

/* Card */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.card-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e2dd;
  transition: all 0.3s ease;
}

.card-item:hover {
  transform: translateY(-3px);
}

.card-item.deleted {
  opacity: 0.6;
  border: 2px dashed #ccc;
  background-color: #f5f5f5;
}

.card-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.card-image {
  width: 280px;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.card-image.grayscale {
  filter: grayscale(10%);
}

.deleted-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
  font-weight: 600;
}

.change-image-btn,
.delete-btn {
  width: 100%;
  padding: 6px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.change-image-btn {
  border: 2px solid #5e514d;
  background: white;
  color: #5e514d;
  font-size: 20px;
}

.change-image-btn:hover:not(:disabled) {
  background: rgba(255, 213, 89, 0.8);
  border: 2px solid #ffd559;
}

.change-image-btn:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.delete-btn {
  border: none;
  background: none;
  color: #ff3b30;
  font-size: 16px;
  text-decoration: underline;
  margin-top: 4px;
}

.delete-btn:hover:not(:disabled) {
  background: #fff5f5;
}

.delete-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  text-decoration: none;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 16px;
  color: #666;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 280px;
  max-width: 90vw;
}

.modal-content h3 {
  text-align: center;
  margin: 0 0 24px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-btn {
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.primary {
  background: #ffd559;
  color: #5e514d;
  border: none;
}

.modal-btn.primary:hover {
  background: #f2c232;
}

.modal-btn.secondary {
  background: #f2f2f7;
  color: #007aff;
  border: none;
}

.modal-btn.secondary:hover {
  background: #e5e5ea;
}

.modal-btn.cancel {
  background: none;
  color: #ff3b30;
  border: 1px solid #ff3b30;
}

.modal-btn.cancel:hover {
  background: #fff5f5;
}

/* 스크롤바 완전히 숨기기 */
.edit-page-scroll {
  /* 웹킷 기반 브라우저 (Chrome, Safari, Edge) */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.edit-page-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
