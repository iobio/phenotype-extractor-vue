import Vue from 'vue';
import Main from './Main.vue';

const Components = {
  Main
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;
