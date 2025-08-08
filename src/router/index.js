import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/pages/MainPage.vue';
import BookingPage from '@/pages/booking/BookingPage.vue';
import MapPage from '@/pages/map/MapPage.vue';
import MyPage from '@/pages/mypage/MyPage.vue';
import AnalysisPage from '@/pages/analysis/AnalysisPage.vue';
import NotFoundPage from '@/pages/common/NotFoundPage.vue';
import BookingAccommodationPage from '@/pages/booking/BookingAccommodationPage.vue';
import FinalBookingPage from '@/pages/booking/FinalBookingPage.vue';
import PaymentPage from '@/pages/payment/PaymentPage.vue';
import QRPage from '@/pages/payment/QRPage.vue';
import LabPage from '@/pages/lab/LabPage.vue';
import FortuneCard from '@/pages/lab/FortuneCard.vue';
import LoginPage from '@/pages/login/LoginPage.vue';
import JoinPage from '@/pages/login/JoinPage.vue';
import AllTransactions from '@/pages/analysis/AllTransactions.vue';
import CardEditPage from '@/pages/card/CardEditPage.vue';
import { useAuthStore } from '@/stores/auth';
import NaverCallback from '@/pages/login/NaverCallback.vue';
import AllCardProductPage from '@/pages/card/AllCardProductPage.vue';
import CardDetailPage from '@/pages/card/CardDetailPage.vue';
import MyCouponPage from '@/pages/mypage/MyCouponPage.vue';
import MyBookingPage from '@/pages/mypage/MyBookingPage.vue';
import MyCardPage from '@/pages/mypage/MyCardPage.vue';
const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainPage,
    meta: { requiresAuth: true },
  },
  { path: '/booking', name: 'Booking', component: BookingPage },
  {
    path: '/accommodation/:id',
    name: 'BookingAccommodationPage',
    component: BookingAccommodationPage,
  },
  {
    path: '/booking/confirm',
    name: 'FinalBookingPage',
    component: FinalBookingPage,
  },
  { path: '/map', name: 'MapPage', component: MapPage },
  { path: '/analysis', name: 'Analysis', component: AnalysisPage },
  {
    path: '/analysis/allTransactions',
    name: 'AllTransactions',
    component: AllTransactions,
    props: route => ({
      // 쿼리 param 이름을 cardId 로 통일
      cardId: route.query.cardId
        ? Number(route.query.cardId)
        : null
    })
  },
  { path: '/mypage', name: 'MyPage', component: MyPage },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
  {
    path: '/accommodation/:id',
    name: 'BookingAccommodationPage',
    component: BookingAccommodationPage,
  },
  {
    path: '/booking/confirm',
    name: 'FinalBookingPage',
    component: FinalBookingPage,
  },
  { path: '/login', name: 'LoginPage', component: LoginPage },
  { path: '/join', name: 'JoinPage', component: JoinPage },
  { path: '/lab', name: 'Lab', component: LabPage },
  { path: '/lab/fortune', name: 'Fortune', component: FortuneCard },
  { path: '/card', name: 'CardEditPage', component: CardEditPage },
  { path: '/lab/fortune', component: FortuneCard },
  { path: '/payment', component: PaymentPage },
  { path: '/allCardProduct', name: 'AllCardProductPage', component: AllCardProductPage },
  { path: '/CardDetail', name: 'CardDetail', component: CardDetailPage },
  {
    path: '/payment/qr',
    component: QRPage,
    meta: { hideNav: true },
  },
  {
    path: '/card-detail/:id', // 1. URL 파라미터 ':productId' 정의
    name: 'CardDetail',
    component: CardDetailPage,
    props: true // 2. [핵심] 이 옵션을 true로 설정!
  },
  {
    path: '/notification',
    name: 'Notification',
    component: () => import('@/pages/notification/NotificationPage.vue'),
    meta: { hideHeader: true },
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
  {
    path: '/naver/callback',
    name: 'NaverCallback',
    component: NaverCallback,
  },
  {
    path: '/mypage/mycouponpage',
    name: 'MyCouponPage',
    component: MyCouponPage
  },
  {
    path: '/mypage/mybookingpage',
    name: 'MyBookingPage',
    component: MyBookingPage
  },
  {
    path: '/mypage/mycardpage',
    name: 'MyCardPage',
    component: MyCardPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isLogin) {
    next('/login');
  } else {
    next();
  }
});

export default router;
