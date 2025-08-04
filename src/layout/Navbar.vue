<template>
  <nav class="bottom-nav bg-white border-top d-flex justify-content-around align-items-center">
    <RouterLink to="/booking" class="nav-item text-center">
      <img src="@/assets/nav-icons/wallet.png" alt="예약" class="nav-icon" />
      <div class="small">혜택까득</div>
    </RouterLink>
    <RouterLink to="/map" class="nav-item text-center">
      <img src="@/assets/nav-icons/maps-and-flags.png" alt="혜택지도" class="nav-icon" />
      <div class="small">혜택지도</div>
    </RouterLink>
    <RouterLink to="/" class="nav-item text-center">
      <img src="@/assets/nav-icons/home.png" alt="홈" class="nav-icon" />
      <div class="small">홈</div>
    </RouterLink>
    <RouterLink to="/analysis" class="nav-item text-center">
      <img src="@/assets/nav-icons/result.png" alt="지출 분석" class="nav-icon" />
      <div class="small">지출 분석</div>
    </RouterLink>
    <RouterLink to="/mypage" class="nav-item text-center">
      <img src="@/assets/nav-icons/user.png" alt="마이페이지" class="nav-icon" />
      <div class="small">마이페이지</div>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: absolute; /* ✅ fixed → absolute */
  bottom: 0;
  width: 100%;
  height: 70px;
  z-index: 1000;
  background-color: #fff;
  border-top: 1px solid #dee2e6;
}

/* ✅ iPad 및 태블릿 사이즈에서 중앙 정렬 + max-width 유지 */
@media (min-width: 768px) and (max-width: 1024px) {
  .bottom-nav {
    left: 50%;
    transform: translateX(-50%);
    max-width: 430px;
  }
}

.nav-item {
  flex: 1;
  padding: 8px 0;
  color: #333;
  text-decoration: none;
}

.nav-item:hover {
  background-color: #f8f9fa;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.small {
  font-size: 12px;
}
</style>
