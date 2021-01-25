<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >

    <div style="height: 180px">
      <!-- <v-btn color="primary" @click="exportGenes">Export</v-btn> -->
      <!-- <v-btn color="primary" @click="exportGenesFlag=true">Export</v-btn> -->
      <!-- <v-btn @click="sendMosaicGeneSet" color="primary">Mosaic gene set</v-btn> -->

    </div>
    <!-- <div class="row" v-if="showLandingPage">
      <div class="col-md-12">
        <v-text-field
          outlined
          type="text"
          id="single_entry_input_landing"
          ref="single_entry_input_landing"
          v-model="textNotes"
          autocomplete="off"
          v-show="textNotes.length<45"
          placeholder="Enter Phenotypes or Type (paste) Clinical Note"
        >
          <template v-slot:append-outer>
            <v-btn style="margin-top:-10px" large :disabled="textNotes.length<4" @click="extract" color="primary">Submit</v-btn>
          </template>
        </v-text-field>
        <typeahead
          v-model="search"
          hide-details="false"
          target="#single_entry_input_landing"
          force-select :force-clear="true"
          :data="DiseaseNames"
          :limit="parseInt(100)"
          v-on:keydown="EnterForSearch"
          v-on:input="mouseSelect"
          item-key="DiseaseName"/>
        <v-textarea
          v-show="textNotes.length>=45"
          v-model="textNotes"
          ref="single_entry_input_landing_textarea"
          id="single_entry_input_landing_textarea"
          name="input-7-4"
          rows="2"
          outlined
        >
        <template v-slot:append-outer>
          <v-btn style="margin-top:-10px" large :disabled="textNotes.length<4" @click="extract" color="primary">Submit</v-btn>
        </template>
      </v-textarea>
      </div>
    </div> -->

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
        :newTermSearched="newTermSearched"
        @exported_genes="exported_genes($event)"
        :exportGenesFlag="exportGenesFlag"
        :gtrResourceUsed="gtrResourceUsed"
        :hpoResourceUsed="hpoResourceUsed"
        :PhenolyzerResourceUsed="PhenolyzerResourceUsed"
        :mosaic_gene_set="mosaic_gene_set">
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
    textNotesLandingPage: '',
    exportGenesFlag: false,
    gtrResourceUsed: false,
    hpoResourceUsed: false,
    PhenolyzerResourceUsed: false,
    mosaic_gene_set: ""
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
      if(genes.length === 0){
        this.PhenolyzerResourceUsed = false;
      }
      else if(genes.length > 1){
        this.PhenolyzerResourceUsed = true;
      }
    },
    HpoGeneList(genes){
      if(genes.length === 0){
        this.hpoResourceUsed = false;
      }
      else if(genes.length > 1){
        this.hpoResourceUsed = true;
      }
    },
    GtrGeneList(genes){
      if(genes.length === 0){
        this.gtrResourceUsed = false;
      }
      else if(genes.length > 1){
        this.gtrResourceUsed = true;
      }
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
    },
    exportGenes() {
      bus.$emit("exportGenes")
    },
    exported_genes(obj){
      console.log("selected", obj.selected);
      console.log("summaryGenes", obj.summary);
      this.exportGenesFlag = obj.exportFlag;
    },
    sendMosaicGeneSet(){
      this.mosaic_gene_set = "TRPV4,SH3TC2,SBF2,RAB7A,PRX,PMP22,PLEKHG5,NEFL,NDRG1,MPZ,MFN2,MED25,LRSAM1,LITAF,HSPB1,HK1,GDAP1,FGD4,EGR2,DNM2"
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
