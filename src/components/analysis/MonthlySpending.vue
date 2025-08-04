<!-- src/components/analysis/MonthlySpending.vue -->
<template>
  <div class="monthly-spending-container">
    <!-- 월 선택 -->
    <div class="month-row">
      <span class="arrow" @click="prevMonth">&lt;</span>
      <span class="month">{{ month }}월</span>
      <span class="arrow" @click="nextMonth">&gt;</span>
    </div>

    <!-- 총액 -->
    <div class="total-amount">{{ totalAmount.toLocaleString() }}원</div>

    <!-- 차트 카드 -->
    <div class="chart-card">
      <div class="compare-row">
        <div v-if="diffSign === 0">지난달과 동일해요</div>
        <div v-else>
          <div>지난달보다</div>
          <div>
            <span class="highlight">{{ diffAmount }}</span>
            <span v-if="diffSign > 0"> 더썼어요</span>
            <span v-else> 덜썼어요</span>
          </div>
        </div>
      </div>

      <div class="bar-chart">
        <div
          v-for="(item, idx) in displayChartData"
          :key="`${item.year}-${item.month}`"
          class="bar-item"
          :class="{ active: item.month === month && item.year === currentYear }"
        >
          <div class="bar" :style="barStyle(idx, item.value)"></div>
          <div class="bar-label">{{ item.month }}월</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getMonthlySpending } from '@/api/analysisindex.js'

const memberId      = 1
const month         = ref(new Date().getMonth() + 1)
const currentYear   = new Date().getFullYear()
const totalAmount   = ref(0)
const diffAmount    = ref('0원')
const diffSign      = ref(0)
const allMonthlyData = ref([])

const displayChartData = computed(() => {
  const arr = []
  const curM = month.value
  for (let i = 3; i >= 1; i--) {
    let m = curM - i, y = currentYear
    if (m <= 0) { m += 12; y-- }
    const d = allMonthlyData.value.find(x => {
      const [yy, mm] = x.yearMonth.split('-').map(Number)
      return yy === y && mm === m
    })
    arr.push({ month: m, year: y, value: d ? d.totalSpent : 0 })
  }
  const cur = allMonthlyData.value.find(x => {
    const [yy, mm] = x.yearMonth.split('-').map(Number)
    return yy === currentYear && mm === curM
  })
  arr.push({ month: curM, year: currentYear, value: cur ? cur.totalSpent : 0 })
  return arr
})

async function loadSummary() {
  try {
    const res = await getMonthlySpending(memberId)
    const list = res.data.data || []
    allMonthlyData.value = list

    const curM = month.value
    const prevM = curM === 1 ? 12 : curM - 1
    const prevY = curM === 1 ? currentYear - 1 : currentYear

    const cur = list.find(x => {
      const [yy, mm] = x.yearMonth.split('-').map(Number)
      return yy === currentYear && mm === curM
    })
    const prev = list.find(x => {
      const [yy, mm] = x.yearMonth.split('-').map(Number)
      return yy === prevY && mm === prevM
    })

    if (cur) {
      totalAmount.value = cur.totalSpent
      if (prev) {
        const diff = cur.totalSpent - prev.totalSpent
        diffSign.value = diff
        diffAmount.value = `${Math.abs(diff).toLocaleString()}원`
      } else {
        diffSign.value = 1
        diffAmount.value = `${cur.totalSpent.toLocaleString()}원`
      }
    } else {
      totalAmount.value = 0
      diffSign.value = 0
      diffAmount.value = '0원'
    }
  } catch (e) {
    console.error('월간 실적 로드 오류:', e)
  }
}

onMounted(loadSummary)
watch(month, loadSummary)

function prevMonth() {
  month.value = month.value === 1 ? 12 : month.value - 1
}
function nextMonth() {
  month.value = month.value === 12 ? 1 : month.value + 1
}

function barStyle(idx, value) {
  const vals = displayChartData.value.map(x => x.value)
  const mx   = Math.max(...vals, 1)
  const h    = value > 0 ? Math.max((value / mx) * 200, 15) : 15
  const isCur = idx === displayChartData.value.length - 1
  return {
    height:       `${h}px`,
    background:   isCur ? '#FFCD39' : '#FFE066',
    borderRadius: '0.25rem 0.25rem 0 0'
  }
}
</script>

<style scoped>
.monthly-spending-container {
  max-width: 390px;
  margin: 0 auto;
  padding: 0.5rem 0 1.5rem;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.month-row {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  margin-top: 1rem;
  font-size:1.3rem;
  /* gap 제거하고 화살표별 margin으로 대체 */
}

.arrow:first-child {
  margin-left:18px;
  margin-right: 23px;  /* <- 와 8월 사이 */
}
.arrow:last-child {
  margin-left: -2px;   /* 8월 와 > 사이 */
}

.arrow {
  font-size: 1rem;
  color: black;
  cursor: pointer;
  transition: color 0.2s;
}
.arrow:hover {
  color: black;
}

.month {
  /* 화살표 사이에 들어가는 텍스트 */
  min-width: 3.125rem;
  color: black;
}

.total-amount {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
  margin-left:18px;
}

.chart-card {
  background: #F5F5F5;
  border-radius: 0.75rem;
  margin: 0 1rem;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.compare-row {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 5rem;
  line-height: 1.3;
}

.highlight {
  color: #FFCD39;
  font-weight: 500;
  margin: 0 0.125rem;
  font-size: 1.3rem;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 3rem;
  padding: 0 2rem;
  height: 10rem;
}

.bar-item {
  flex: 1;
  min-width: 1.5rem;
  max-width: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  transition: height 0.3s;
  border-radius: 0.25rem 0.25rem 0 0;
}

.bar-item.active .bar-label {
  color: #FFCD39;
  font-weight: 700;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  color: #999;
  text-align: center;
}

@media (max-width: 375px) {
  .total-amount,
  .bar-chart {
    padding: 0 0.75rem;
  }
  .bar-chart {
    gap: 0.75rem;
    height: 9rem;
  }
  .bar-item {
    min-width: 1.5rem;
    max-width: 2.5rem;
  }
}
</style>
