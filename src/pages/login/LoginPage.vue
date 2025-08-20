<template>
  <div
    class="container min-vh-100% d-flex flex-column justify-content-center align-items-center bg-white py-4"
  >
    <!-- 로고 및 문구 -->
    <div class="logo">
      <img
        src="@/assets/login-icons/login_logo.png"
        alt="로그인 페이지 로고 사진"
        class="login-logo"
      />
    </div>

    <!-- 입력 폼 -->
    <form class="login-form" @submit.prevent="login">
      <!-- 이메일 입력 -->
      <label class="form-label">이메일</label>
      <input
        v-model="loginForm.email"
        type="email"
        class="input-lg"
        autocomplete="email"
      />

      <!-- 비밀번호 입력 -->
      <label class="form-label mt-16">비밀번호</label>
      <input v-model="loginForm.password" type="password" class="input-lg" />

      <!-- 아이디/비밀번호 찾기 -->
      <div class="finder">
        <div class="text-end text-warning small mb-3" type="button">
          아이디 / 비밀번호 찾기 &gt;
        </div>
      </div>

      <!-- 로그인 버튼 -->
      <button class="btn-yellow" type="submit">로그인</button>

      <!-- 네이버 로그인 버튼 -->
      <button class="btn-naver" type="button" @click="goNaver">
        <img
          src="@/assets/login-icons/naver_icon.png"
          alt="네이버 아이콘"
          class="naver-icon"
        />
        <span>네이버 아이디로 로그인</span>
      </button>

      <!-- 회원가입 -->
      <p class="signup">
        아직 회원이 아니신가요?
        <router-link to="/join" class="signup-link">회원가입</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import authApi from '@/api/authApi';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const clientId = import.meta.env.VITE_NAVER_API_CLIENT_ID;
const callbackURL = import.meta.env.VITE_NAVER_LOGIN_CALLBACK_URL
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

const redirectUri = encodeURIComponent(callbackURL); // 로그인 완료 후 돌아올 URI

// 로그인 URL 생성
const naverLoginUrl = ref(
  `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
);
const goNaver = () => {
  window.location.href = naverLoginUrl.value;
};
</script>

<style scoped>
.login-logo {
  margin: 100px auto;
  width: 250px;
  height: auto;
}

.login-form {
  width: 100%;
  max-width: 430px;
  padding: 20px 20px 40px;
  box-sizing: border-box;
}

.form-label {
  display: block;
  font-size: 16px;
  color: grey;
  margin: 0;
}

.mt-16 {
  margin-top: 16px;
}

.input-lg {
  width: 100%;
  height: 56px;
  border: 0;
  border-radius: 18px;
  background: #f7f7f7;
  padding: 0 18px;
  font-size: 16px;
  color: #222;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}
.input-lg::placeholder {
  color: #a9afb8;
}

.finder {
  margin: 10px 0 18px;
  text-align: left;
}
.link-underline {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #f8bf26;
  text-decoration: underline;
  text-decoration-color: #f8bf26;
  cursor: pointer;
}

.btn-yellow,
.btn-naver {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.12s ease;
}

.btn-yellow {
  background: #ffcc2b;
  margin-bottom: 14px;
}
.btn-yellow:active,
.btn-naver:active {
  transform: translateY(1px);
}

.naver-icon {
  width: 40px;
  height: auto;
}

.btn-naver {
  background: #03c75a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.signup {
  margin: 22px 0 0;
  text-align: center;
  color: #9aa0a6;
}
.signup-link {
  color: #f8bf26;
  margin-left: 6px;
  text-decoration: underline;
}

/* 작은 화면 보정 */
@media (max-width: 360px) {
  .btn-yellow,
  .btn-naver {
    height: 54px;
    font-size: 18px;
  }
  .input-lg {
    height: 52px;
  }
}
</style>
