<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      Phenotype Extractor
      <!-- <PhenotypeExtractor
        :phenotypes="phenotypes"
        @summaryGenes="summaryGenes($event)"
        @saveSearchedPhenotypes="saveSearchedPhenotypes($event)"
        :VennDiagramData="analysis.payload.VennDiagramData">
      </PhenotypeExtractor> -->
      <PhenotypeExtractor
        :phenotypes="analysis.payload.phenotypes"
        :summaryFullGeneList="analysis.payload.summaryGeneList"
        @summaryGenes="summaryGenes($event)"
        @saveSearchedPhenotypes="saveSearchedPhenotypes($event)"
        :VennDiagramData="analysis.payload.VennDiagramData"
        @GtrGeneList="GtrGeneList($event)"
        @PhenolyzerGeneList="PhenolyzerGeneList($event)"
        @HpoGeneList="HpoGeneList($event)"
        :AddedGenes="AddedGenes"
        @GtrTerms="GtrTerms($event)">
      </PhenotypeExtractor>

      <br>
      <Phenotypes
        :phenotypes="analysis.payload.phenotypes">
      </Phenotypes>
      <br>
      Gene list
      <!-- <GeneList
        :summaryGeneList="summaryGeneList">
      </GeneList> -->
      <GeneList
        :summaryGeneList="analysis.payload.genesReport"
        @importedGenes="importedGenes($event)"
        @UpdateListOnDelete="UpdateListOnDelete($event)">
      </GeneList>
    </v-layout>
  </v-container>
</template>

<script>
import { Client } from 'iobio-api-client';
const api = new Client('backend.iobio.io', { secure: true });
import DiseaseNamesData from '../data/DiseaseNames.json';
import DiseaseNames from '../data/DiseaseNamesCleaned.json';
import HPO_Phenotypes from '../data/HPO_Phenotypes';
import HPO_Terms from '../data/HPO_Terms';
import HpoTermsData from '../data/HpoTermsData.json';
import { bus } from '../main';
import GtrSearch from './GtrSearch.vue';
import PhenotypeExtractor from './PhenotypeExtractor.vue'
import GeneList from './GeneList.vue'
import analysisData from '../data/analysis.json';
import PhenotypistData from '../data/PhenotypistState.json';
import Model from '../models/Model';
var model = new Model();
import Phenotypes from './Phenotypes.vue';



export default {
  name: 'Main',
  components: {
    GtrSearch,
    PhenotypeExtractor,
    GeneList,
    Phenotypes
  },
  data: () => ({
    gtrGenes: [],
    summaryGeneList: [],
    phenotypes: [],
    analysis: null,
    PhenotypistState: null,
    AddedGenes:[],
    GtrPhenotypes: [],
    // phenotypes: [
    //   [
    //     {
    //       "DiseaseName": "Dejerine-Sottas disease",
    //       "ConceptID": "C0011195",
    //       "general": true,
    //       "gtrSearchStatus": "Completed"
    //     }
    //   ],
    //   [
    //     {
    //       "id": "dejerine sottas disease",
    //       "label": "dejerine sottas disease",
    //       "value": "dejerine sottas disease",
    //       "general": true,
    //       "phenolyzerSearchStatus": "Completed"
    //     }
    //   ],
    //   [
    //
    //   ]
    // ]
  }),
  watch: {
  },
  created(){
    this.analysis = analysisData;
    this.PhenotypistState = PhenotypistData;
  },
  mounted(){
  },
  methods: {
    summaryGenes(genes){
      this.summaryGeneList = genes;
      this.analysis.payload.genesReport = this.summaryGeneList;
    },
    saveSearchedPhenotypes(phenotypes){
      console.log("phenotypes", phenotypes)
      this.analysis.payload.phenotypes = phenotypes;
    },
    importedGenes(genes){
      this.AddedGenes = genes;
    },
    PhenolyzerGeneList(genes){
    },
    HpoGeneList(genes){
    },
    GtrGeneList(genes){
    },
    UpdateListOnDelete(genes){
      this.summaryGeneList = genes;
      this.analysis.payload.genesReport = genes;
    },
    GtrTerms(terms){
      console.log("gtr terms", terms)
      this.GtrPhenotypes = terms;
    }
  }
};
</script>


<style lang="sass" scoped>
  #single_entry_input
    width: 600px
    height: 49px
    margin-top: 7px
    border: 0
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)
    border-radius: 0
    font-size: 16px

  #single_entry_input_textarea
    width: 600px
    margin-top: 7px

  .reviewCard
    height: 250px
    overflow-y: auto
</style>
