<template>
  <div
    class="container min-vh-100 d-flex flex-column justify-content-center align-items-center bg-white py-4"
  >
    <!-- 로고 및 문구 -->
    <div class="text-center mb-4">
      <h1 class="fw-bold display-6">
        <span class="text-dark">카드</span><span class="text-warning">까득</span
        ><br />
        <span class="text-dark">혜택</span
        ><span class="text-warning">까득</span>
      </h1>
      <p class="mt-2 text-muted small">당신의 모든 카드 혜택을 확인하세요!</p>
    </div>

    <!-- 이메일 입력 -->
    <input
      v-model="email"
      type="email"
      placeholder="이메일"
      class="form-control form-control-sm mb-2"
      style="max-width: 320px"
    />

    <!-- 비밀번호 입력 -->
    <input
      v-model="password"
      type="password"
      placeholder="비밀번호"
      class="form-control form-control-sm mb-2"
      style="max-width: 320px"
    />

    <!-- 아이디/비번 찾기 -->
    <div
      class="text-end text-warning small mb-3"
      style="width: 100%; max-width: 320px"
    >
      아이디 / 비밀번호 찾기 &gt;
    </div>

    <!-- 로그인 버튼 -->
    <button
      @click="login"
      class="btn btn-warning text-white w-100 mb-2"
      style="max-width: 320px"
    >
      로그인
    </button>

    <!-- 네이버 로그인 버튼 -->
    <a :href="naverLoginUrl">
      <img
        src="@/assets/login-icons/naverLogin_btn.png"
        alt="네이버 로그인"
        style="height: 48px"
      />
    </a>

    <!-- 회원가입 -->
    <p class="mt-4 small text-muted">
      아직 회원이 아니신가요?
      <span class="text-warning fw-semibold" style="cursor: pointer"
        >회원가입</span
      >
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');

function login() {
  console.log('로그인 시도:', email.value, password.value);
}

function goToNaverLogin() {
  console.log('네이버 로그인 버튼 클릭됨');
  // 네이버 로그인 리다이렉트 처리
}
</script>
