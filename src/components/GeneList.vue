<template>
  <v-container>
    <v-layout
      text-center
      row wrap
    >
      <v-flex xs12 sm12 md12 lg12>
        <v-card>
          <v-card-title>
            Gene list
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="summaryGeneList"
            :search="search"
          >
          <template v-slot:item.name="{ item }">
            <v-chip @click="showGeneInfo(item.name)" dark>{{ item.name }}</v-chip>
          </template>
          <template v-slot:item.searchTermsPhenolyzer="{ item }">
    				<div v-for="(x, i) in item.searchTermsPhenolyzer">
    					<v-chip class="mb-1 mt-2"> # {{ x.rank}}. {{ x.searchTerm }}</v-chip>
    				</div>
          </template>
          <template v-slot:item.searchTermsGtr="{ item }">
            <div v-for="(x, i) in item.searchTermsGtr">
              <v-chip class="mb-1 mt-2"> # {{ x.rank}}. {{ x.searchTerm }}</v-chip>
            </div>
          </template>
          <template v-slot:item.searchTermHpo="{ item }">
            <div v-for="(x, i) in item.searchTermHpo">
              <v-chip class="mb-1 mt-2"> {{ x.searchTerm }}</v-chip>
            </div>
          </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

import GeneModel from '../models/GeneModel';
var geneModel = new GeneModel();

export default {
  name: 'GeneList',
  components: {
  },
  props: {
    summaryGeneList: {
      type: Array
    }
  },
  watch:{
    summaryGeneList(){
      this.GtrGeneList = this.summaryGeneList;
    }
  },
  data () {
    return {
      search: '',
      GtrGeneList: [],
      headers: [
        { text: 'Gene Name', align: 'left', value: 'name', sortable: false, },
        { text: 'GTR', value: 'searchTermsGtr', sortable: false, },
        { text: 'Phenolyzer', value: 'searchTermsPhenolyzer', sortable: false, },
        { text: 'HPO', value: 'searchTermHpo', sortable: false, },
      ],
      clickedGene: {},
      ncbiSummary: null,
      dialog: false,
    }
  },

  methods: {
    showGeneInfo(gene){
      this.clickedGene = gene;
      geneModel.promiseGetNCBIGeneSummary(gene.name)
      .then((data)=>{
        this.ncbiSummary = data;
      })
      this.dialog = true;
    },
  }

}

</script>

<style lang="sass">
  body, .v-application
    font-family: 'Poppins', sans-serif

  .v-application--wrap
    font-family: 'Poppins', sans-serif

  .v-btn
    text-transform: none

</style>
