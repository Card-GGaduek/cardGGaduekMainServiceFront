import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        memberId: null,
        selectedCardId: null
    }),
    actions: {
        setUser(id) {
            this.memberId = id
        },
        setCard(cardId) {
            this.selectedCardId = cardId
        }
    }
})