<template>
  <div class="connect-login-container">
    <!-- Header -->
    <SubHeader />

    <!-- Main Content -->
    <div class="main-content">
      <h1 class="title">카드 연동하기 로그인</h1>
      <p class="subtitle">카드 연동을 위해 로그인 정보를 입력해주세요.</p>

      <!-- Lock Icon -->
      <div class="icon-container">
        <img src="@/assets/cardselect/lock.png" alt="Lock" class="lock-icon" />
      </div>

      <!-- Login Form -->
      <div class="form-container">
        <div class="input-group">
          <input
              type="text"
              v-model="userId"
              placeholder="아이디"
              class="input-field"
          />
        </div>

        <div class="input-group">
          <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="비밀번호"
              class="input-field"
          />
        </div>

        <button
            class="login-button"
            @click="handleLogin"
            :disabled="!userId || !password"
        >
          로그인
        </button>

        <div class="links-container">
          <button class="link-button" @click="findId">아이디 찾기</button>
          <span class="divider">|</span>
          <button class="link-button" @click="resetPassword">비밀번호 재설정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SubHeader from "@/layout/SubHeader.vue";

export default {
  name: 'ConnectLoginPage',
  components: {
    SubHeader
  },
  data() {
    return {
      userId: '',
      password: '',
      showPassword: false
    }
  },
  methods: {
    handleLogin() {
      if (!this.userId || !this.password) {
        return;
      }

      // 로그인 로직 구현
      console.log('Login attempt:', {
        userId: this.userId,
        password: this.password
      });

      // API 호출 또는 다음 페이지로 이동
      // this.$router.push('/card-connect-next');
    },
    findId() {
      // 아이디 찾기 로직
      console.log('Find ID clicked');
    },
    resetPassword() {
      // 비밀번호 재설정 로직
      console.log('Reset password clicked');
    }
  }
}
</script>

<style scoped>
.connect-login-container {
  min-height: 100%;
  background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 20px 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 40px;
}

.icon-container {
  display: flex;
  justify-content: flex-end;
}

.lock-icon {
  width: 300px;
  height: 300px;
}

.form-container {
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 40px 20px;
  margin: 0 -20px;
  flex: 1;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 16px;
}

.input-field {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: #f8f9fa;
  transition: border-color 0.2s, background-color 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #FFD700;
  background: #fff;
}

.input-field::placeholder {
  color: #999;
}

.login-button {
  width: 100%;
  padding: 16px;
  background: #FFD700;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  margin: 24px 0;
  transition: all 0.2s;
}

.login-button:hover:not(:disabled) {
  background: #FFC107;
  transform: translateY(-1px);
}

.login-button:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  transform: none;
}

.links-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.link-button {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;
}

.link-button:hover {
  color: #333;
}

.divider {
  color: #ccc;
  font-size: 14px;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .title {
    font-size: 24px;
  }

  .lock-icon {
    width: 100px;
    height: 100px;
  }

  .form-container {
    padding: 32px 16px;
  }
}
</style>