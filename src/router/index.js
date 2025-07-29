import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/MainPage.vue'
import BookingPage from '@/pages/booking/BookingPage.vue'
import MapPage from '@/pages/map/MapPage.vue'
import MyPage from '@/pages/mypage/MyPage.vue'
import AnalysisPage from '@/pages/analysis/AnalysisPage.vue'
import NotFoundPage from '@/pages/common/NotFoundPage.vue'

const routes = [
  { path: '/', name: 'Main', component: MainPage },
  { path: '/booking', name: 'Booking', component: BookingPage },
  { path: '/map', name: 'Map', component: MapPage },
  { path: '/analysis', name: 'Analysis', component: AnalysisPage },
  { path: '/mypage', name: 'MyPage', component: MyPage },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
