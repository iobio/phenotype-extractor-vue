import Vue from 'vue';
import Main from './Main.vue';
import PhenotypeExtractor from './PhenotypeExtractor.vue';
import GeneList from './GeneList.vue'

const Components = {
  Main,
  PhenotypeExtractor,
  GeneList
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;
