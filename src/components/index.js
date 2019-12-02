import Vue from 'vue';
import Main from './Main.vue';
import PhenotypeExtractor from './PhenotypeExtractor.vue';

const Components = {
  Main,
  PhenotypeExtractor
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;
