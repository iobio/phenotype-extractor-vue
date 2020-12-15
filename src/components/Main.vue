<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >

    <div style="height: 180px">

    </div>
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
        @vennData="vennData($event)"
        :demoTextNote="analysis.payload.demoTextNote"
        @VennDiagramData="VennDiagramData($event)"
        :geneToDelete="geneToDelete"
        @new_term_searched="new_term_searched($event)"
        :textNotesLandingPage="textNotesLandingPage">
      </PhenotypeExtractor>

      <!-- <Phenotypes
        :phenotypes="analysis.payload.phenotypes">
      </Phenotypes> -->
      <!-- Gene list -->
      <!-- <GeneList
        :summaryGeneList="summaryGeneList">
      </GeneList> -->
      <GeneList
        :summaryGeneList="analysis.payload.genesReport"
        @importedGenes="importedGenes($event)"
        @UpdateListOnDelete="UpdateListOnDelete($event)"
        :phenotypeTerms="analysis.payload.phenotypes"
        :venn_diag_data="venn_diag_data"
        @bus_delete_gene="bus_delete_gene"
        @gene_to_delete="gene_to_delete($event)"
        @add_to_gene_set="add_to_gene_set($event)"
        :selectedGenesForGeneSet="analysis.payload.selectedGenesForGeneSet"
        @update_genes_top="update_genes_top($event)"
        :topGenesSelectedCount="analysis.payload.genesTop"
        :newTermSearched="newTermSearched">
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
// import analysisData from '../data/mosaic_analysis.json';
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
    Phenotypes,
  },
  data: () => ({
    gtrGenes: [],
    summaryGeneList: [],
    phenotypes: [],
    analysis: null,
    PhenotypistState: null,
    AddedGenes:[],
    GtrPhenotypes: [],
    venn_diag_data: {},
    geneToDelete: '',
    deletedGenesList: [],
    selectedGenesForGeneSet: [],
    genesTop: 20,
    newTermSearched: false,
    textNotes: '',
    showLandingPage: true,
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
    console.log("mounted", this.analysis);
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
    vennData(data){
      this.venn_diag_data = data;
    },
    VennDiagramData(obj){
      this.analysis.payload.VennDiagramData = obj
    }, 
    gene_to_delete(gene){
      this.geneToDelete = gene; 
    },
    bus_delete_gene(gene){
      this.deletedGenesList.push(gene);
      this.updateGeneListsOfEachTool();
    },
    updateGeneListsOfEachTool(){
      let phenolyzerCompleteList = this.analysis.payload.phenolyzerFullList;
      let phenolyzer_res = []; 
      phenolyzerCompleteList.map(gene => {
        if(!this.deletedGenesList.includes(gene.name)){
          phenolyzer_res.push(gene);
        }
      })
      this.analysis.payload.phenolyzerFullList = phenolyzer_res;
    },
    add_to_gene_set(genes){
      this.selectedGenesForGeneSet = genes;
    },
    update_genes_top(number){
      this.genesTop = number;
    },
    new_term_searched(flag){
      this.newTermSearched = flag;
    },
    extract(){
      this.showLandingPage = false;
      this.textNotesLandingPage = this.textNotes;
    }
  }
};
</script>


<style lang="sass" scoped>
  #single_entry_input_landing
    width: 600px
    height: 49px
    margin-top: 7px
    border: 0
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)
    border-radius: 0
    font-size: 16px

  #single_entry_input_landing_textarea
    width: 600px
    margin-top: 7px

  .reviewCard
    height: 250px
    overflow-y: auto


  @media (min-width: 960px)
    .container
      max-width: 960px

  @media (min-width: 1050px)
    .container
      max-width: 1050px

  @media (min-width: 1175px)
    .container
      max-width: 1175px

  @media (min-width: 1264px)
    .container
      max-width: 1264px

  @media (min-width: 1330px)
    .container
      max-width: 1330px

  @media (min-width: 1440px)
    .container
      max-width: 1440px

  @media (min-width: 1550px)
    .container
      max-width: 1550px

  @media (min-width: 1635px)
    .container
      max-width: 1635px
</style>
