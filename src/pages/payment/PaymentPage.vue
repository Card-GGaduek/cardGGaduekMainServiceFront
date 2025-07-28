<template>
  <div>
    <h2>💳 결제 페이지 (토스페이먼츠)</h2>
    <button @click="requestPayment">테스트 결제 진행</button>
  </div>
</template>

<script setup>
// 💡 실제로는 Pinia나 API에서 가져온 데이터 사용
const memberId = 1;
const cardId = 2;
const storeId = 3;
const productId = 4;
const amount = 101;
const category = 'FOOD';

const requestPayment = () => {
  const IMP = window.IMP;
  IMP.init("imp47740267");

  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  const merchantUid = "order_" + new Date().getTime();

  IMP.request_pay({
    pg: "uplus",
    pay_method: "card",
    merchant_uid: merchantUid,
    name: "토스 일반 카드결제 테스트",
    amount: amount,
    buyer_email: "test@example.com",
    buyer_name: "홍길동",
    buyer_tel: "010-1234-5678",
    buyer_addr: "서울시 강남구",
    buyer_postcode: "12345",
    ...(isMobile && {
      m_redirect_url: "http://localhost:5173/payment/complete"
    })
  }, async function (rsp) {
    if (!isMobile) {
      if (rsp.success) {
        const res = await fetch("http://localhost:8080/payment/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid,
            memberId,
            cardId,
            storeId,
            productId,
            amount,
            category
          })
        });

        const result = await res.json();
        if (result.success) {
          alert("✅ 결제 및 거래내역 저장 성공!");
        } else {
          alert("⚠️ 결제는 되었지만 거래 저장 실패: " + result.message);
        }
      } else {
        alert("❌ 결제 실패: " + rsp.error_msg);
      }
    }
  });
};
</script>
