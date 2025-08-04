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
      v-model="loginForm.email"
      type="email"
      placeholder="이메일"
      class="form-control form-control-sm mb-2"
      style="max-width: 320px"
    />

    <!-- 비밀번호 입력 -->
    <input
      v-model="loginForm.password"
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
      <router-link
        to="/join"
        class="text-warning fw-semibold"
        style="cursor: pointer"
      >
        회원가입
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import authApi from '@/api/authApi';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const clientId = import.meta.env.VITE_NAVER_API_CLIENT_ID;
const authStore = useAuthStore();

const loginForm = reactive({
  email: '',
  password: '',
});
// const email = ref('');
// const password = ref('');

// function login() {
//   console.log('로그인 시도:', email.value, password.value);
// }

const login = async () => {
  if (!loginForm.email) {
    alert('이메일을 입력하세요.');
    return;
  }

  if (!loginForm.password) {
    alert('비밀번호를 입력하세요.');
    return;
  }

  try {
    const result = await authApi.login(loginForm.email, loginForm.password);
    authStore.login(result);
    router.push('/');
  } catch (e) {
    alert(e.message);
  }
};

const generateState = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// localStorage 또는 sessionStorage에 저장 (서버 세션이 없으므로 클라이언트 저장)
const state = generateState();
sessionStorage.setItem('naver_oauth_state', state);

const redirectUri = encodeURIComponent('http://localhost:5173/naver/callback'); // 로그인 완료 후 돌아올 URI

// 로그인 URL 생성
const naverLoginUrl = ref(
  `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
);
</script>
