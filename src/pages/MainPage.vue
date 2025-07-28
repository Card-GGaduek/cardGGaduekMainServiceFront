<template>
  <div>
    <h2>💳 메인페이지</h2>
    <!--결제하기 버튼 -> 토스페이먼트로 연결-->
    <button @click="goToPayment">결제페이지이동</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToPayment = () => {
  router.push("/payment");
};
</script>

<style scoped>
button {
  margin-top: 1rem;
  padding: 10px 20px;
  background-color: #ffca00;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>
