<template>
  <div>
    <v-expansion-panels
      v-model="searchterms_expansion_panel"
      multiple>
      <v-expansion-panel>
        <v-expansion-panel-header>
          GTR Terms
        </v-expansion-panel-header>
        <v-expansion-panel-content class="mt-4">
          <div v-if="GtrTermsAdded.length">
            <v-chip style="float:left" class="mb-2" color="primary" v-for="(term, i) in GtrTermsAdded" close :key="i" @click:close="remove(term, i, 'GTR')">
              <span style="color:white" v-if="term.DiseaseName!==undefined">{{ i+1 }} . {{ term.DiseaseName }}</span>
              <span style="color:white" v-else> {{ i+1 }} . {{ term }}</span>
            </v-chip>
          </div>
          <span v-if="GtrTermsAdded.length===0">
            <v-chip style="float:left"><v-icon left>error_outline</v-icon> No conditions</v-chip>
          </span>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header>
          Phenolyzer Terms
        </v-expansion-panel-header>
        <v-expansion-panel-content class="mt-4">
          <div v-if="phenolyzerTermsAdded.length">
            <v-chip style="float:left" class="mb-2" color="primary" v-for="(term, i) in phenolyzerTermsAdded" close :key="i" @click:close="remove(term, i, 'phenolyzer')">
              <span style="color:white"> {{ i+1 }} . {{ term.value }}</span>
            </v-chip>
          </div>
          <div class="mb-2" v-if="phenolyzerTermsAdded.length===0">
            <v-chip style="float:left"><v-icon left>error_outline</v-icon> No phenotypes</v-chip>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header>
          HPO Terms
        </v-expansion-panel-header>
        <v-expansion-panel-content class="mt-4">
          <div class="mb-2" v-if="hpoTermsAdded.length">
            <v-chip style="float:left" color="primary" v-for="(term, i) in hpoTermsAdded" close :key="i" @click:close="remove(term, i, 'HPO')">
              <span style="color:white"> {{ i+1 }} . {{ term.HPO_Data }}</span>
            </v-chip>
          </div>
          <div class="mb-2" v-if="hpoTermsAdded.length===0">
            <v-chip style="float:left"><v-icon left>error_outline</v-icon> No HPO terms</v-chip>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>


<script>
import { bus } from '../main';

  export default {
    name: 'Phenotypes',

    props: {
      phenotypes: {
        type: Array
      }
    },

    data: () => ({
      GtrTermsAdded: [],
      phenolyzerTermsAdded: [],
      hpoTermsAdded: [],
      searchterms_expansion_panel: [0, 1, 2]
    }),

    watch: {
      phenotypes(){
        this.GtrTermsAdded = this.phenotypes[0];
        this.phenolyzerTermsAdded = this.phenotypes[1];
        if(this.phenotypes.length){
          this.hpoTermsAdded = this.phenotypes[2];
        }
      }
    },

    created(){
      this.GtrTermsAdded = this.phenotypes[0];
      this.phenolyzerTermsAdded = this.phenotypes[1];
      if(this.phenotypes.length && this.phenotypes[2].length){
        this.hpoTermsAdded = this.phenotypes[1];
      }
    },

    methods: {
      remove(term, idx, component) {
        var term_details = {
          term,
          idx,
          component
        }
        bus.$emit("removePhenotype", term_details)
      }
    },

  }

</script>

<style lang="sass" scoped>
  .v-expansion-panel--active > .v-expansion-panel-header
    min-height: 10px

</style>
