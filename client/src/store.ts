import { defineStore } from 'pinia';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    identity: 'Patient', // default value
  }),
  actions: {
    setIdentity(identity: string) {
      this.identity = identity;
    },
  },
});