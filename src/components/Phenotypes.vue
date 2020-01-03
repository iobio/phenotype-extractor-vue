<template>
  <div>
    Phenotypes
    <div class="col-md-12 mb-2">
      <strong style="float:left">GTR Terms: </strong>
      <br>
      <div class="mb-2" v-if="GtrTermsAdded.length">
        <v-chip color="primary" v-for="(term, i) in GtrTermsAdded" close :key="i" @click:close="remove(term, i, 'GTR')">
          <span style="color:white" v-if="term.DiseaseName!==undefined">{{ i+1 }} . {{ term.DiseaseName }}</span>
          <span style="color:white" v-else> {{ i+1 }} . {{ term }}</span>
        </v-chip>
      </div>
      <span v-if="GtrTermsAdded.length===0">
        <v-chip style="float:left"><v-icon left>error_outline</v-icon> No conditions</v-chip>
      </span>
    </div>
    <div class="col-md-12 mb-2">
      <strong style="float:left">Phenolyzer Terms: </strong>
      <br>
      <div class="mb-2" v-if="phenolyzerTermsAdded.length">
        <v-chip color="primary" v-for="(term, i) in phenolyzerTermsAdded" close :key="i" @click:close="remove(term, i, 'phenolyzer')">
          <span style="color:white"> {{ i+1 }} . {{ term.value }}</span>
        </v-chip>
      </div>
      <div class="mb-2" v-if="phenolyzerTermsAdded.length===0">
        <v-chip style="float:left"><v-icon left>error_outline</v-icon> No phenotypes</v-chip>
      </div>
    </div>
    <div class="col-md-12 mb-2">
      <strong style="float:left">HPO Terms: </strong>
      <br>
      <div class="mb-2" v-if="hpoTermsAdded.length">
        <v-chip color="primary" v-for="(term, i) in hpoTermsAdded" close :key="i" @click:close="remove(term, i, 'HPO')">
          <span style="color:white"> {{ i+1 }} . {{ term.HPO_Data }}</span>
        </v-chip>
      </div>
      <div class="mb-2" v-if="hpoTermsAdded.length===0">
        <v-chip style="float:left"><v-icon left>error_outline</v-icon> No HPO terms</v-chip>
      </div>
    </div>
    <br>
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
      hpoTermsAdded: []
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

<style lang="scss" scoped>

</style>
