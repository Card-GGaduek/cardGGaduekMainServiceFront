import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/MainPage.vue'
import BookingPage from '@/pages/booking/BookingPage.vue'
import MapPage from '@/pages/map/MapPage.vue'
import MyPage from '@/pages/mypage/MyPage.vue'
import AnalysisPage from '@/pages/analysis/AnalysisPage.vue'
import NotFoundPage from '@/pages/common/NotFoundPage.vue'
import BookingAccommodationPage from '@/pages/booking/BookingAccommodationPage.vue'
import FinalBookingPage from '@/pages/booking/FinalBookingPage.vue'
import PaymentPage from "@/pages/payment/PaymentPage.vue"
import QRPage from '@/pages/payment/QRPage.vue'
import LabPage from '@/pages/lab/LabPage.vue'
import FortuneCard from '@/pages/lab/FortuneCard.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import JoinPage from '@/pages/login/JoinPage.vue'
import axios from 'axios';
const routes = [
  { path: '/', name: 'Main', component: MainPage },
  { path: '/booking', name: 'Booking', component: BookingPage },
  { path: '/accommodation/:id', name: 'BookingAccommodationPage', component: BookingAccommodationPage },
  { path: '/booking/confirm', name: 'FinalBookingPage', component: FinalBookingPage },
  { path: '/map', name: 'Map', component: MapPage },
  { path: '/analysis', name: 'Analysis', component: AnalysisPage },
  { path: '/mypage', name: 'MyPage', component: MyPage },
  { path: '/login', name: 'LoginPage', component: LoginPage },
  { path: '/join', name: 'JoinPage', component: JoinPage },
  { path: '/lab', name: 'Lab', component: LabPage },
  { path: '/lab/fortune', component: FortuneCard },
  { path: '/payment', component: PaymentPage },
  {
    path: '/payment/qr',
    component: QRPage,
    meta: { hideNav: true }
  },
  {
    path: '/notification',
    name: 'Notification',
    component: () => import('@/pages/notification/NotificationPage.vue'),
    meta: { hideHeader: true }
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
