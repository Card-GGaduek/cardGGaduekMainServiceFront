<template>
  <div>
    <SubHeader />
    <div class="card-select">
      <!-- 상단 타이틀: 전부 텍스트 -->
      <div class="title-wrap">
        <div class="title-1">카드가득에서 관리할<br> 자산을 골라주세요</div>
        <div class="title-2">카드사 선택하기 ›</div>
      </div>

      <!-- 3열 그리드 -->
      <div class="grid">
        <button
            v-for="issuer in issuers"
            :key="issuer.id"
            type="button"
            class="tile"
            :class="{ on: selected === issuer.id }"
            @click="select(issuer.id)"
        >
          <img :src="issuer.logo" :alt="issuer.name" />
          <span>{{ issuer.name }}</span>
        </button>
      </div>

      <!-- 하단 연결 버튼 -->
      <div class="bottom">
        <div class="bottom-inner">
          <button class="connect" :disabled="!selected" @click="submit">
            연결하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import KB from '@/assets/cardselect/국민카드.jpg'
import HYUNDAI from '@/assets/cardselect/현대카드.jpg'
import SAMSUNG from '@/assets/cardselect/삼성카드.png'
import NH from '@/assets/cardselect/농협카드.png'
import SHINHAN from '@/assets/cardselect/신한카드.png'
import WOORI from '@/assets/cardselect/우리카드.png'
import LOTTE from '@/assets/cardselect/롯데카드.jpg'
import HANA from '@/assets/cardselect/하나카드.png'
import SubHeader from "@/layout/SubHeader.vue";

const router = useRouter()

const issuers = [
  { id: 'KB', name: 'KB국민카드', logo: KB, organization: "0301" },
  { id: 'HYUNDAI', name: '현대카드', logo: HYUNDAI, organization: "0302" },
  { id: 'SAMSUNG', name: '삼성카드', logo: SAMSUNG, organization: "0303" },
  { id: 'NH', name: 'NH농협카드', logo: NH, organization: "0304" },
  { id: 'SHINHAN', name: '신한카드', logo: SHINHAN, organization: "0306" },
  { id: 'WOORI', name: '우리카드', logo: WOORI, organization: "0309" },
  { id: 'LOTTE', name: '롯데카드', logo: LOTTE, organization: "0311" },
  { id: 'HANA', name: '하나카드', logo: HANA, organization: "0313" },
]

const selected = ref(null)

function select(id) {
  selected.value = selected.value === id ? null : id
}

function submit() {
  if (selected.value) {
    const issuer = issuers.find(i => i.id === selected.value)
    if (issuer) {
      router.push({
        name: 'ConnectLoginPage',
        query: { issuerId: issuer.id, organization: issuer.organization } // 카드사 id를 쿼리로 전달
      })
    }
  } else {
    alert('카드사를 선택해주세요.')
  }
}
</script>

<style scoped>
.card-select {
  max-width: 520px;
  margin: 0 auto;
  padding: 16px 16px 88px;
  background: #f5f7fb;
  min-height: 100%;
}

/* 타이틀 전부 텍스트 */
.title-wrap {
  margin-bottom: 12px;
}
.title-1 {
  font-size: 24px;
  font-weight: 800;
  color: #222;
  line-height: 1.35;
}
.title-2 {
  margin-top: 6px;
  font-size: 16px;
  color: #6b7280;
}

/* 항상 3열 고정 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* 최소한의 타일 스타일 */
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tile.on {
  border-color: #ffcd39;
  box-shadow: 0 0 0 3px rgba(255,205,57,0.25);
}
.tile img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 4px;
}
.tile span {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* 하단 고정 버튼 - 수정된 부분 */
.bottom {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);       /* 가운데 정렬 */
  width: 100%;
  max-width: 430px;                   /* 컨텐츠 폭 제한 */
  padding: 20px 16px;
  background: linear-gradient(to top, #f5f7fb 60%, transparent);
  z-index: 100;
}

.bottom-inner {
  width: 100%;
  max-width: 520px;
}

.connect {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  background: #ffcd39;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}
.connect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.connect:not(:disabled):hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

/* 모바일 대응 */
@media (max-width: 600px) {
  .card-select {
    padding: 16px 12px 88px;
  }

  .bottom {
    padding: 20px 12px;
  }
}

@media (max-width: 480px) {
  .card-select {
    padding: 16px 8px 88px;
  }

  .bottom {
    padding: 20px 8px;
  }

  .tile {
    padding: 12px 6px;
  }

  .tile img {
    width: 40px;
    height: 40px;
  }

  .tile span {
    font-size: 12px;
  }
}

@media (max-width: 320px) {
  .bottom {
    padding: 16px 4px;
  }

  .connect {
    font-size: 14px;
    height: 40px;
  }
}
</style>