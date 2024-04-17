import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    identity: 'Doctor'
  }),
  actions: {
    setIdentity(identity: string) {
      this.identity = identity;
    }
  }
});
