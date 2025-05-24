// eventBus.js
import { reactive, readonly } from 'vue';

const listeners = reactive({});

export const eventBus = {
  emit(event, ...args) {
    if (listeners[event]) {
      listeners[event].forEach(listener => listener(...args));
    }
  },
  on(event, listener) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(listener);
  },
  off(event, listener) {
    if (listeners[event]) {
      const index = listeners[event].indexOf(listener);
      if (index > -1) {
        listeners[event].splice(index, 1);
      }
    }
  }
};

export default readonly(eventBus);
