<template>
  <v-container style="margin-top:-35px">

    <div class="row">
      <div class="col-md-12">
        <v-card>
          <span v-show="summaryGenes.length && selectedTab=='HPO'">
            <div v-if="filterTermsIntersectText.length || filterSpecificityScoreText.length">
              <v-alert
                v-if="setGenesOverlapFlag || setSpecificityScoreFlag"
                dense
                text
                color="success"
                style="font-size:12px; word-break:break-word;margin-bottom: -20px;"
              >
               <div style="text-align:center">
                 <span v-if="setGenesOverlapFlag"> {{ filterTermsIntersectText }} </span>
                 <span v-if="setGenesOverlapFlag && setSpecificityScoreFlag && filterTermsIntersectText.length && filterSpecificityScoreText.length"><strong> AND </strong></span>
                 <span v-if="setSpecificityScoreFlag"> {{ filterSpecificityScoreText }}</span>
               </div>
               </v-alert>

            </div>
          </span>
          <div id="gene-data-table" >
            <v-card-title>
              <strong>
                <span>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <span v-on="on" style="cursor:help">Genes</span>
                    </template>
                    <span>
                      The entered clinical note is used to generate the following list of genes that may be associated with the patient's phenotypes and/or disorder. 
                      <br>
                      These disease:gene associations are used in the Review Variants step.</span>
                  </v-tooltip>
                </span>
              </strong>
              <VennDiagram
                v-show="summaryGenes.length && selectedTab=='Input'"
                :vennData="vennData">
              </VennDiagram>

              <v-spacer></v-spacer>
              <div class="row">
                <!-- <div class="col-md-1"></div> -->
                <div class="col-md-7">
                  <div v-if="summaryGenes.length">
                    <div class="col-md-3">
                    </div>
                    <div class="col-md-9">
                      <span style="font-weight:200; font-size:13px; position: absolute; width:100%; margin-left: -140px">
                        <input
                          class="form-control editTextInput"
                          type="number"
                          min="0"
                          max="50"
                          v-model="genesTop"
                          autocomplete="off"
                          style="display:inline"
                          v-on:change="updateGenesTop"
                          >
                        <span class="ml-1">gene<span v-if="genesTop>1">s</span> selected
                          <span>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-icon v-on="on" style="font-size:18px; opacity: 0.8">info_outline</v-icon>
                              </template>
                              <span v-if="!launchedFromGenePanel">
                                All variants in the genes selected here will be analyzed in the Review Variants step.
                                <br>
                                You can manually add or remove genes from the list, or choose the top N genes (20 by default) to analyse.
                              </span>
                              <span v-if="launchedFromGenePanel">
                                You can manually add or remove genes from the list, or choose the top N genes (20 by default) to export.
                              </span>
                            </v-tooltip>                  
                          </span>
                        </span>
                      </span>
                    </div>
                    <!-- <div class="col-md-2" style="margin-top:5px">
                      <span style="display:inline">
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-switch v-on="on" style="display:inline" v-model="selectedGenesFlag"></v-switch>
                          </template>
                          <span v-if="!selectedGenesFlag"> Toggle to select upto 50 genes from the below gene list to be reviewed in "Review variants" step of the workflow.</span>
                          <span v-else> Top <strong>{{selected.length}}</strong>  genes are selected from the below gene list to be reviewed in "Review variants" step. </span>
                        </v-tooltip>
                      </span>
                    </div> -->
                  </div>
                </div>
                <!-- <div class="col-md-1"></div> -->

                <div class="col-md-4">
                  <div v-if="summaryGenes.length">
                    <v-text-field
                      v-model="search"
                      append-icon="search"
                      label="Search in gene list"
                      single-line
                      hide-details
                    ></v-text-field>
                  </div>
                </div>
                <div class="col-md-1 "></div>
              </div>
              <v-dialog persistent v-model="copyPasteGenes" max-width="500px">
                <!-- <template v-slot:activator="{ on }">
                  <v-btn color="primary" class="mr-3" :class="{'mt-3' : !summaryGenes.length }" v-on="on">
                    <v-icon class="mr-1">add</v-icon>
                    Manually Add Genes
                  </v-btn>
                </template> -->
                <v-card>
                  <v-card-title primary-title>
                  </v-card-title>
                  <v-card-text>
                    <div>
                      <v-autocomplete
                        id="autocompleteGenesInput"
                        ref="autocompleteGenesInputRef"
                        chips
                        :items="knownGenesData"
                        v-model="autocompleteGenes"
                        clearable
                        deletable-chips
                        multiple
                        small-chips
                        flat
                        outlined
                        label="Select gene(s)"
                        :search-input.sync="autoCompleteGenesInputSearch"
                        @change="autoCompleteGenesInputSearch=''"
                      ></v-autocomplete>
                    </div>
                    <div id="enter-genes-input">
                      <v-textarea
                        id="copy-paste-genes"
                        multi-line
                        rows="10"
                        outlined
                        label="Paste or add gene names"
                        v-model="genesToApply"
                      >
                      </v-textarea>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn style="float:right" @click.native="onApplyGenes">
                      Apply
                    </v-btn>
                    <v-btn style="float:right" @click.native="copyPasteGenes = false, genesToApply = null, autocompleteGenes=[]">
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

            </v-card-title>
            <v-data-table
              v-if="!geneTableLoading"
              :headers="headers"
              :items="summaryGenes"
              :search="search"
              :items-per-page="15"
              class="gene-list-table"
              :footer-props="{
                itemsPerPageOptions:[20, 50, 100, -1]
              }"
            >
            
            <template v-slot:no-data>
              <div class="table-no-data pt-2">
                <MissingGeneListIcon />
              </div>
            </template>

            <template v-slot:item.idx="{ item }">
              <span style="margin-left: 15px" @mouseover="mouseOverGeneName(item.name)" @mouseleave="mouseLeaveGeneName">
                {{ item.idx + 1 }}
              </span>
            </template>

              <template v-slot:item.name="{ item }">
                <!-- <span v-if="hoveredGeneName===item.name" class="ml-1" > -->
                <span style="width:240px" @mouseover="mouseOverGeneName(item.name)" @mouseleave="mouseLeaveGeneName">
                  <v-chip @click="showGeneInfo(item)"  dark>{{ item.name }}</v-chip>
                </span>
              </template>
              
              <template v-slot:item.associatedGenesBadge="{ item }" style="width:10px !important">
                <span v-if="item.isAssociatedGene!==undefined && item.isAssociatedGene===true"> 
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon style="font-size:20px; margin-left: -18px" color="primary" v-on="on">verified_user</v-icon>
                    </template>
                    <span>This gene is reported to be associated with the selected condition in GTR.</span>
                  </v-tooltip>
                </span>
              </template>
              
              <template v-slot:item.info="{ item }" style="width:10px !important">
                <span>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn icon  @click="showGeneInfo(item)" v-on="on">
                        <v-icon small style="font-size:16px; opacity: 0.8">
                          open_in_new
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Gene info</span>
                  </v-tooltip>                  
                </span>
              </template>
              
              <template v-slot:item.actions="{ item }" style="width:10px !important">
                <span>
                  <!-- <v-btn icon color="red lighten-2 " @click="checkBeforeDeleteGene(item)">
                    <v-icon small style="font-size:18px; opacity: 0.8">
                      far fa-times-circle
                    </v-icon>
                  </v-btn> -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn icon  @click="checkBeforeDeleteGene(item)" v-on="on">
                        <v-icon small style="font-size:16px; opacity: 0.8">
                          delete
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Delete gene</span>
                  </v-tooltip>
                </span>
              </template>
              <template v-slot:item.searchTermsPhenolyzer="{ item }">
        				<div v-for="(x, i) in item.searchTermsPhenolyzer">
        					<v-chip outlined class="mb-1 mt-1 i-chips--terms"> # {{ x.rank}}. {{ x.searchTerm | to-firstCharacterUppercase }}</v-chip>
        				</div>
              </template>
              <template v-slot:item.searchTermsGtr="{ item }">
                <div v-for="(x, i) in item.searchTermsGtr">
                  <v-chip outlined class="mb-1 mt-1 i-chips--terms"> # {{ x.rank}}. {{ x.searchTerm }}</v-chip>
                </div>
              </template>
              <template v-slot:item.searchTermHpo="{ item }">
                <div v-for="(x, i) in item.searchTermHpo">
                  <v-chip outlined class="mb-1 mt-1 i-chips--terms"> {{ getPhenotypFromHPO_id(x.searchTerm) }}</v-chip>
                  <!-- <v-chip outlined class="mb-1 mt-2"> {{ x.searchTerm }}</v-chip> -->
                </div>
              </template>
              <template v-slot:item.isImportedGenes="{ item }">
                <span v-if="item.isImportedGenes">
                  <v-icon style="color:#455A64">check_circle_outline</v-icon>
                </span>
              </template>
              
              <template v-slot:item.inGeneSet="{ item }">
                <span v-model="item.inGeneSet" @click="selectItem(item)" v-if="item.inGeneSet">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on">
                        <v-icon style="opacity: 1">
                          library_add_check
                        </v-icon>
                      </v-btn>
                    </template>
                    <span> <strong>{{item.name}}</strong> is added to gene set </span>
                  </v-tooltip>                  
                </span>
                 
                <span v-model="item.inGeneSet" @click="selectItem(item)" v-if="!item.inGeneSet">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on">
                        <v-icon style="opacity: 0.6">
                          check_box_outline_blank
                        </v-icon>
                      </v-btn>
                    </template>
                    <span> Add <strong>{{item.name}}</strong> to gene set </span>
                  </v-tooltip>                  
                </span>
              </template>
              
            </v-data-table>
          </div>

          <v-skeleton-loader
            :loading="geneTableLoading"
            :transition="transition"
            type="table"
            v-if="geneTableLoading"
          >

          </v-skeleton-loader>

        </v-card>
      </div>
      <div class="col-md-3">
        <!-- <Phenotypes
          :phenotypes="phenotypes">
        </Phenotypes> -->
        <!-- <VennDiagram
          :vennData="vennData">
        </VennDiagram> -->
      </div>
    </div>

    <v-layout
      text-center
      row wrap
    >
      <v-flex xs9 sm9 md9 lg9>

      </v-flex>

      <v-flex class="ml-2">

      </v-flex>

      <!-- Bypassed genes dialog -->
      <v-dialog v-model="byPassedGenesDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Warning</v-card-title>
          <v-card-text>
            <p v-if="byPassedGenes.length>2">
              Bypassing unknown genes: {{ byPassedGenes }}
            </p>
            <p v-if="dupGenes.length>2">
              Bypassing duplicate genes: {{ dupGenes }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn style="float:right" @click.native="byPassedGenesDialog = false">
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!--End Bypassed genes dialog -->

      <!-- Modal to confirm gene deletion  -->
      <v-dialog v-model="deleteGeneDialog" max-width="400">
        <v-card>
          <v-card-title class="headline"></v-card-title>
          <v-card-text>
            {{deleteGeneConfirmationText}}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="deleteGene">Yes</v-btn>
            <v-btn color="primary" text @click="cancelDeleteGene">No</v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>
      <!--End Modal to confirm gene deletion -->
      
      <!-- Modal to show gene info -->
      <v-dialog v-model="geneInfoDialog" scrollable max-width="800px">
       <v-card>
         <v-card-title>
           <span class="headline">{{ clickedGene.name }}</span>
         </v-card-title>
         <v-divider></v-divider>
         <v-card-text v-if="ncbiSummary!==null ">
          <GeneCard
            :gene="clickedGene.name"
            :ncbiSummary="ncbiSummary"
            :geneData="clickedGene"
            :specificityScore="clickedGene.specificityScore"
            :scaledScore="clickedGene.scaledScore"
            >
          </GeneCard>
         </v-card-text>
         <v-divider></v-divider>
         <v-card-actions>
           <v-spacer></v-spacer>
           <v-btn color="primary" text @click="geneInfoDialog = false">Close</v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>

      <!-- End modal to show gene info -->
      
      
      <!-- Dialog to show warning to select upto 50 genes  -->
      <v-dialog
        v-model="warningDialog"
        hide-overlay
        persistent
        width="400"
      >
        <v-card
          color="primary"
          dark
        >
        <v-card-title primary-title>
          <v-spacer></v-spacer>
          <v-btn small icon @click="warningDialog=false">
            <v-icon small style="opacity: 0.6">close</v-icon>
          </v-btn>
        </v-card-title>
          <v-card-text style="padding-bottom:30px">
            <span class="mt-2 mb-2" style="font-size:16px">
              Please select upto 50 genes for review. 
            </span>
          </v-card-text>
        </v-card>
      </v-dialog>
    <!--End Dialog to show warning to select upto 50 genes  -->

    </v-layout>
  </v-container>
</template>

<script>

import knownGenes from '../data/knownGenes';
import GeneModel from '../models/GeneModel';
var geneModel = new GeneModel();
import { bus } from '../main';
import HPO_Phenotypes from '../data/HPO_Phenotypes';
import HPO_Terms from '../data/HPO_Terms';
import HpoTermsData from '../data/HpoTermsData.json';
// import hpo_genes from '../data/hpo_genes.json';
import Phenotypes from './Phenotypes.vue';
import VennDiagram from './VennDiagram.vue'; 
import GeneCard from './GeneCard.vue'

import MissingGeneListIcon from '../partials/MissingGeneListIcon.vue'; 

export default {
  name: 'GeneList',
  components: {
    Phenotypes,
    VennDiagram, 
    GeneCard,
    MissingGeneListIcon
  },
  props: {
    summaryGeneList: {
      type: Array
    },
    phenotypeTerms: {
      type: Array
    },
    venn_diag_data: {
      type: Object
    },
    selectedGenesForGeneSet: {
      type: Array
    },
    topGenesSelectedCount: null,
    newTermSearched: {
      type: Boolean
    },
    exportGenesFlag: null,
    gtrResourceUsed: null,
    hpoResourceUsed: null,
    PhenolyzerResourceUsed: null,
    mosaic_gene_set: null,
    launchedFromGenePanel: {
      type: Boolean,
      default: false
    },
    stateHpoSummaryGenesProps: null,
    stateSummaryGenesProps: null,
    filterTermsIntersectTextProps: null,
    filterSpecificityScoreTextProps: null,
    setGenesOverlapFlagProps: null,
    setSpecificityScoreFlagProps: null,
  },
  watch:{
    selectedGenesFlag(){
      if(this.selectedGenesFlag){
        this.EnableToSelectGenes()
      }
      else {
        this.deselectAllGenes();
      }
    },
    summaryGeneList(){
      // this.summaryGenes = this.summaryGeneList;
      this.organizeTableHeaders();
      this.organizeGeneList();
    },
    phenotypeTerms(){
      this.phenotypes = this.phenotypeTerms
    },
    venn_diag_data(){
      this.vennData = this.venn_diag_data;
    },
    genesTop(){
    },
    autocompleteGenes(){
    },
    selectedGenesForGeneSet(){
    },
    exportGenesFlag(){
      if(this.exportGenesFlag){
        this.exportGenesForDownload();
      }
    },
    mosaic_gene_set(){
      if(this.mosaic_gene_set.length){
        this.genesToApply = this.mosaic_gene_set;
        this.onApplyGenes();
      }
    },
    selected(){
    }
  },
  data () {
    return {
      search: '',
      summaryGenes: [],
      genes:[],
      headers: this.organizeTableHeaders(),
      clickedGene: {},
      ncbiSummary: null,
      dialog: false,
      copyPasteGenes: false,
      knownGenesData: null,
      genesToApply: null,
      byPassedGenes: "",
      dupGenes: "",
      byPassedGenesDialog: false,
      deleteGeneDialog: false,
      deleteGeneConfirmationText: "",
      geneToDelete: null,
      geneTableLoading:false,
      transition: 'scale-transition',
      HpoGenesData: null,
      HpoTermsTypeaheadData: null,
      HPO_Phenotypes_data: null,
      HPO_Terms_data: null,
      phenotypes: [],
      vennData: {},
      hoveredGeneName: '',
      geneInfoDialog: false, 
      selected: [],
      genesTop: 20,
      selectedGenesFlag: true,
      warningDialog: false,
      autocompleteGenes: [],
      autoCompleteGenesInputSearch: '',
      addedGenesFlag: false,
      setGenesOverlapFlag: false,
      setSpecificityScoreFlag: false,
      lower_genesoverlap: 0,
      higher_genesoverlap: 0,
      lower_scaledScore: 0,
      higher_scaledScore: 0,
      selectedTab: "Input",
      filterSpecificityScoreText: "",
      filterTermsIntersectText: "",
      stateSummaryGenes: [],
      stateHpoSummaryGenes: [],
      newlyAddedManualGenes: [],
    }
  },

  mounted(){
    // organize table headers on mount
    this.organizeTableHeaders();
    this.knownGenesData = knownGenes;
    // this.summaryGenes = this.summaryGeneList;
    
    if(this.stateSummaryGenesProps.length){
      this.stateSummaryGenes = this.stateSummaryGenesProps;
    }
    
    if(this.stateHpoSummaryGenesProps.length){
      this.stateHpoSummaryGenes = this.stateHpoSummaryGenesProps;
    }
    
    if(this.filterTermsIntersectTextProps.length){
      this.filterTermsIntersectText = this.filterTermsIntersectTextProps;
      this.setGenesOverlapFlag = this.setGenesOverlapFlagProps;
    }
    
    if(this.filterSpecificityScoreTextProps.length){
      this.filterSpecificityScoreText = this.filterSpecificityScoreTextProps;
      this.setSpecificityScoreFlag = this.setSpecificityScoreFlagProps;
    }
    
    if(this.selectedGenesForGeneSet!==undefined){
      if(this.selectedGenesForGeneSet.length){
        this.selected = this.selectedGenesForGeneSet;
        this.selectedGenesFlag = true;
        if(this.topGenesSelectedCount!==undefined){
          this.genesTop = parseInt(this.topGenesSelectedCount);
        }
        else {
          this.genesTop = 20;
        }
      }
      else {
        this.selected = [];
      }
      this.organizeGeneListOnMount();
    }
    else {
      this.selected = [];
      this.genesTop = 20;
      this.organizeGeneList();
    }


    // this.HpoGenesData = hpo_genes;
    this.HpoTermsTypeaheadData  = HpoTermsData.data;
    this.HPO_Terms_data = HPO_Terms;
    console.log("this.HPO_Terms_data in mounted", this.HPO_Terms_data);
    this.HPO_Phenotypes_data = HPO_Phenotypes;
    this.vennData = this.venn_diag_data;
  },

  created(){
    bus.$on("show-gene-table-skeleton-loaders", ()=>{
      this.geneTableLoading = true;
    });

    bus.$on("hide-gene-table-skeleton-loaders", ()=>{
      this.geneTableLoading = false;
    });
    
    bus.$on("exportGenes", () => {
      this.exportGenesForDownload();
    })
    
    bus.$on("hpoSelectionRange", (arr) => {
      this.lower_genesoverlap = arr[0];
      this.higher_genesoverlap = arr[1];
      if(this.lower_genesoverlap == this.higher_genesoverlap){
        if(this.lower_genesoverlap == undefined){
          this.filterTermsIntersectText = "";
          this.$emit("filter_terms_inspect_text", this.filterTermsIntersectText);

          this.setGenesOverlapFlag = false;
          this.$emit("set_genes_overlap_flag", this.setGenesOverlapFlag);
          
          if(this.setSpecificityScoreFlag){
            this.selectGenesFromScaledScore();
          }
          else if (!this.setSpecificityScoreFlag) {
            this.selected = [];
            this.genesTop = this.selected.length;
            this.organizeListBasedOnFilters();
            this.$emit("update_genes_top", this.genesTop);
            this.$emit("add_to_gene_set", this.selected)
          }
        }
        else{
          this.selectGenesForHpoTermsCount();
        }
      }
      else {
        this.selectGenesForHpoTermsCount();
      }
    })
    
    bus.$on("filterOnGenesOverlap", (flag) => {
      this.setGenesOverlapFlag = flag;
      this.$emit("set_genes_overlap_flag", this.setGenesOverlapFlag);
    })
    
    bus.$on("hpoScaledScoreRange", (arr) => {
      this.lower_scaledScore = arr[0]; 
      this.higher_scaledScore = arr[1];
      if(this.lower_scaledScore == this.higher_scaledScore){
        if(this.lower_scaledScore == 0) {
          this.filterSpecificityScoreText = "";
          this.$emit("filter_specificity_score_text", this.filterSpecificityScoreText);
          
          this.setSpecificityScoreFlag = false;
          this.$emit("set_specificity_score_flag", this.setSpecificityScoreFlag);
          
          if (this.setGenesOverlapFlag) {
            this.selectGenesForHpoTermsCount();
            return;
          }
          else if (!this.setGenesOverlapFlag) {
            this.selected = [];
            this.genesTop = this.selected.length;
            this.organizeListBasedOnFilters();
            this.$emit("update_genes_top", this.genesTop);
            this.$emit("add_to_gene_set", this.selected)
          }
        }
        else {
          this.selectGenesFromScaledScore();
        }
      }
      else {
        this.selectGenesFromScaledScore();
      }
    })
    
    bus.$on("filterOnSpecificityScore", (flag) => {
      this.setSpecificityScoreFlag = flag;
      this.$emit("set_specificity_score_flag", this.setSpecificityScoreFlag);
    })
    
    bus.$on("selected-tab", (tab) => {
      this.selectedTab = tab;
      this.organizeGeneListBasedOnSelectedTab(this.selectedTab); 
    })
    
    bus.$on("manually-add-genes", () => {
      this.copyPasteGenes = true;
    })
    
    this.phenotypes = this.phenotypeTerms;

  },

  updated(){
  },

  methods: {
    showGeneInfo(gene){
      this.clickedGene = gene;
      geneModel.promiseGetNCBIGeneSummary(gene.name)
      .then((data)=>{
        this.ncbiSummary = data;
        this.geneInfoDialog = true;
      })
    },

    onApplyGenes(){
      this.addedGenesFlag = true;
      this.copyPasteGenes = false;
      this.dupGenes= "",
      this.byPassedGenes = "";
      this.newlyAddedManualGenes = []; 
      
      var arr = [];
      if(this.genesToApply){
        this.genesToApply = this.genesToApply.trim().replace(/\n/g, " ").replace(/,/g, " ").replace(/\s+/g, " ").replace(/;/g, " ").replace(/\t+/g, " ");
        arr = [...this.autocompleteGenes, ...this.genesToApply.split(" ")];
      }
      else{
        arr = this.autocompleteGenes;
      }
      var byPassedGenes = "";
      var byPassedGenesArr = [];
      var duplicateGenes = [];

      arr.map(x=>{
        if(this.knownGenesData.includes(x.toUpperCase()) && !this.genes.includes(x.toUpperCase()) ){
          this.genes.push(x.toUpperCase());
        }
        else if(this.genes.includes(x.toUpperCase()) && !duplicateGenes.includes()){
          duplicateGenes.push(x.toUpperCase())
        }
        else {
          byPassedGenesArr.push(x.toUpperCase());
        }
      })

      if(byPassedGenesArr.length>0){
        this.byPassedGenes = "" + byPassedGenesArr.join(" , ") + "  ";
      }
      if(duplicateGenes.length>0){
        this.dupGenes = "" + duplicateGenes.join(" , ") + "  ";
      }

      if(byPassedGenesArr.length>0 || duplicateGenes.length>0){
        this.byPassedGenesDialog = true;
      }
      this.$emit("importedGenes", this.genes);
      this.genesToApply = null;
      this.autocompleteGenes = [];
      
            
      var uppercasedArr = arr.map(gene => gene.toUpperCase());

      if(this.genes.length){
        this.genes.map(x => {
          if(uppercasedArr.includes(x)) {
            this.newlyAddedManualGenes.push(x);
          }
        })
      }
      else {
        this.newlyAddedManualGenes = this.genes;
      }
      
      setTimeout(()=>{
        this.addedGenesFlag = false;
        this.newlyAddedManualGenes = []; 
      }, 5000)
    },

    checkBeforeDeleteGene(gene){
      this.deleteGeneConfirmationText = `Are you sure you want to delete the gene ${gene.name}?`;
      this.deleteGeneDialog = true;
      this.geneToDelete = gene;
    },

    cancelDeleteGene(){
      this.geneToDelete = null;
      this.deleteGeneDialog = false;
    },

    deleteGene(){
      // this.$emit("gene_to_delete", this.geneToDelete.name)
      this.$emit("bus_delete_gene", this.geneToDelete.name)
      bus.$emit("delete_gene", this.geneToDelete.name)
      let idx = this.genes.findIndex(x => x === this.geneToDelete.name);
      this.genes.splice(idx, 1)
      this.deleteGeneDialog = false;
      // this.geneTableLoading = true;
      // this.$emit("UpdateListOnDelete", this.summaryGenes)
      // let idx = this.summaryGenes.findIndex(x => x.name === this.geneToDelete.name);
      // this.summaryGenes.splice(idx, 1)
    },

    getPhenotypFromHPO_id(id){
      console.log("this.HPO_Terms_data in getPhenotypFromHPO_id", this.HPO_Terms_data);
      var idx = this.HPO_Terms_data.indexOf(id);
      var phenotype = this.HPO_Phenotypes_data[idx];
      return `${phenotype} [ ${id} ]`
    },
    
    organizeGeneListOnMount(){
      console.log("summary gene list on mount", this.summaryGeneList);
      var associatedGenes = [];
      var nonAssociatedGenes = [];

      if(this.summaryGeneList!==undefined){
        
        this.summaryGeneList.map(x=>{
          if(x.isAssociatedGene===true){
            associatedGenes.push(x);
          }
          else{
            nonAssociatedGenes.push(x);
          }
        })

        if(associatedGenes.length){
          this.summaryGenes = [...associatedGenes, ...nonAssociatedGenes];
        }
        else {
          this.summaryGenes = this.summaryGeneList;
        }
        
        this.summaryGenes.forEach((gene, idx) => {
          // gene.idx = idx; //this changes the order of the previous list
          if(this.selected.includes(gene.name)){
            this.$set(this.summaryGenes[idx], 'inGeneSet', true);
          }
          else {
            this.$set(this.summaryGenes[idx], 'inGeneSet', false);
          }
        })
        
      }
      else {
        this.summaryGenes = [];
      }
    },

    organizeGeneList(){
      console.log("organizeGeneList", this.summaryGeneList);
      var associatedGenes = [];
      var nonAssociatedGenes = [];
      if(this.summaryGeneList!==undefined){
        
        // this.summaryGeneList.forEach((gene, idx) => {
        //   gene.idx = idx;
        //   if(this.selected.includes(gene.name)){
        //     this.$set(this.summaryGeneList[idx], 'inGeneSet', true);
        //   }
        //   else {
        //     this.$set(this.summaryGeneList[idx], 'inGeneSet', false);
        //   }
        // })

        this.summaryGeneList.map(x=>{
          if(x.isAssociatedGene===true){
            associatedGenes.push(x);
          }
          else{
            nonAssociatedGenes.push(x);
          }
        })

        if(associatedGenes.length){
          this.summaryGenes = [...associatedGenes, ...nonAssociatedGenes];
        }
        else {
          this.summaryGenes = this.summaryGeneList;
        }
        
        this.summaryGenes.forEach((gene, idx) => {
          gene.idx = idx;
          if(this.selected.includes(gene.name)){
            this.$set(this.summaryGenes[idx], 'inGeneSet', true);
          }
          else {
            this.$set(this.summaryGenes[idx], 'inGeneSet', false);
          }
        })
        
        this.stateSummaryGenes = [...this.summaryGenes]; 
        this.$emit("state_summary_genes", this.stateSummaryGenes); 
        
        if(!this.addedGenesFlag){
          //Set stateHPOGenes summary to empty when new terms are searched but not when new genes are added. 
          this.stateHpoSummaryGenes = [];
          this.$emit("state_hpo_summary_genes", this.stateHpoSummaryGenes)
        }

        // if(this.summaryGenes.length < 20){
        //   this.genesTop = this.summaryGenes.length;
        // }
        // else {
        //   this.genesTop = 20;
        // }
        // check to call this function only when a new term is searched.
        if(this.newTermSearched){
          if(this.launchedFromGenePanel){
            this.selectTopGenes(20);
          }
          else {
            this.selectTopGenes(this.genesTop);
          }
        }
        else if(this.addedGenesFlag){
          this.organizeListBasedOnFilters();
          // this.selectTopGenes(this.genesTop);
        }
        else if(this.geneToDelete){
          this.selectTopGenesAfterDelete(this.genesTop);
        }
      }
      else {
        this.summaryGenes = [];
      }
    },
    
    selectGenesFromScaledScore(){      
      let lower = this.lower_scaledScore; 
      let higher = this.higher_scaledScore;
      this.selected = [];

      if (lower == higher) {
        if (lower == 0) {
          this.filterSpecificityScoreText = "";
          this.setSpecificityScoreFlag = false;
          this.$emit("set_specificity_score_flag", this.setSpecificityScoreFlag);
        }
      }
      else {
        this.filterSpecificityScoreText = ` Genes with a specificity score => ${lower} and <= ${higher}.`;
      }
      
      this.$emit("filter_specificity_score_text", this.filterSpecificityScoreText);

      
      this.summaryGenes.map(gene => {
        if(this.setGenesOverlapFlag){
          if((gene.searchTermHpo.length >= this.lower_genesoverlap && gene.searchTermHpo.length <= this.higher_genesoverlap) && (Number(gene.scaledScore) >= lower && Number(gene.scaledScore) <= higher)){
            gene.inGeneSet = true;
            this.selected.push(gene.name);
          }
          else{
            gene.inGeneSet = false;
          }
        }
        else {
          if(Number(gene.scaledScore) >= lower && Number(gene.scaledScore) <= higher){
            gene.inGeneSet = true;
            this.selected.push(gene.name);
          }
          else { 
            gene.inGeneSet = false;
          }
        }
      })
      
      this.genesTop = this.selected.length;
      this.$emit("update_genes_top", this.genesTop);
      
      this.$emit("add_to_gene_set", this.selected)
      
      this.organizeListBasedOnFilters();
    },
    
    selectGenesForHpoTermsCount(){      
      let lower = this.lower_genesoverlap; 
      let higher = this.higher_genesoverlap;

      this.selected = [];
      
      if (lower == higher) {
        if (lower == undefined) {
          this.filterTermsIntersectText = "";
          this.setGenesOverlapFlag = false;
          this.$emit("set_genes_overlap_flag", this.setGenesOverlapFlag)
        }
        else {
          this.filterTermsIntersectText = `Genes associated with ${lower} HPO terms `;
        }
      }
      else {
        this.filterTermsIntersectText = `Genes associated with => ${lower} and <= ${higher} HPO terms `;
      }
      
      this.$emit("filter_terms_inspect_text", this.filterTermsIntersectText);
      
      if(this.setSpecificityScoreFlag){
        this.summaryGenes.map(gene => {
          if((Number(gene.scaledScore) >= this.lower_scaledScore && Number(gene.scaledScore) <= this.higher_scaledScore) &&(gene.searchTermHpo.length >= lower && gene.searchTermHpo.length <= higher)){
            gene.inGeneSet = true;
            this.selected.push(gene.name);
          }
          else { 
            gene.inGeneSet = false;
          }
        })
      }
      else if(!this.setSpecificityScoreFlag){
        if(higher === lower){
          this.summaryGenes.map(gene => {
            if(gene.searchTermHpo.length == higher){
              gene.inGeneSet = true;
              this.selected.push(gene.name);
            }
            else { 
              gene.inGeneSet = false;
            }
          })
        }
        else {
          this.summaryGenes.map(gene => {
            if(gene.searchTermHpo.length >= lower && gene.searchTermHpo.length <= higher){
              gene.inGeneSet = true;
              this.selected.push(gene.name);
            }
            else { 
              gene.inGeneSet = false;
            }
          })

        }
      }

      this.genesTop = this.selected.length;
      this.$emit("update_genes_top", this.genesTop);
      
      this.$emit("add_to_gene_set", this.selected); 
      
      this.organizeListBasedOnFilters();
    },
    
    organizeListBasedOnFilters(){
      var selectedArr = []; 
      var notSelected = [];
      
      var state_summary = []; 
      
      if(this.selectedTab === 'HPO'){
        this.stateSummaryGenes.map(gene => {
          if(this.selected.includes(gene.name)){
            if(gene.searchTermHpo.length){
              selectedArr.push(gene); 
            }
          }
          else {
            if(gene.searchTermHpo.length){
              notSelected.push(gene); 
            }
          }
        })
      }
      else if(this.selectedTab === 'Input'){
        this.stateSummaryGenes.map((gene, i) => {
          if(this.selected.includes(gene.name) || this.newlyAddedManualGenes.includes(gene.name)){
            gene.inGeneSet = true;
            if(!this.selected.includes(gene.name)){
              this.selected.push(gene.name)
            }
            // this.$set(this.stateSummaryGenes[i], 'inGeneSet', true);

            selectedArr.push(gene); 
          }
          else {
            notSelected.push(gene); 
          }
        })
      }
      
      var temp = [...selectedArr, ...notSelected]; 
      this.summaryGenes = temp; 
      
      if(!this.selected.length){
        this.summaryGenes.map(gene => {
          gene.inGeneSet = false;
        })
      }
      else {
        this.genesTop = this.selected.length;
        this.$emit("update_genes_top", this.genesTop);

        this.$emit("add_to_gene_set", this.selected)
      }
      console.log("this.summaryGenes changed", this.summaryGenes);
      this.$emit("reorder_summary_genes", this.summaryGenes)
    },
    
    organizeGeneListBasedOnSelectedTab(tab){
      var temp = []; 
      if(tab === "HPO"){
        var temp_summary_genes = []; 
        this.stateHpoSummaryGenes.length > 0 ? temp_summary_genes = this.stateHpoSummaryGenes : temp_summary_genes = this.stateSummaryGenes
        this.stateSummaryGenes.map(gene => {
          if(gene.searchTermHpo.length) {
            temp.push(gene); 
          }
        })
        if (!this.stateHpoSummaryGenes.length) {
          this.stateHpoSummaryGenes = temp; 
          this.$emit("state_hpo_summary_genes", this.stateHpoSummaryGenes)
        }
        this.organizeListBasedOnFilters(); 
      }
      else if(tab === "Input"){
        this.stateSummaryGenes.map(gene => {
          temp.push(gene); 
        })
        // this.summaryGenes = temp;
        this.organizeListBasedOnFilters(); 
      }
      this.organizeTableHeaders();
    },

    mouseOverGeneName(gene){
      this.hoveredGeneName = gene;
    },

    mouseLeaveGeneName(){
      this.hoveredGeneName = '';
    },
    
    selectItem(item){
      if(!item.inGeneSet){
        item.inGeneSet = true;
        this.summaryGenes[item.idx].inGeneSet = true;
        this.selected.push(this.summaryGenes[item.idx].name);
      }
      else {
        item.inGeneSet = false;
        this.summaryGenes[item.idx].inGeneSet = false;
        this.selected.splice(this.selected.indexOf(item.name), 1)
        this.selected = [...this.selected];
      }
      this.genesTop = this.selected.length;
      this.$emit("update_genes_top", this.genesTop);

      this.$emit("add_to_gene_set", this.selected)
    },
    deselectAllGenes(){
      this.selected = [];
      for (var i = 0; i < this.summaryGenes.length; i++) {
        this.summaryGenes[i].inGeneSet = false;
      }
      this.$emit("add_to_gene_set", this.selected)
    },
    selectTopGenes(numberOfGenesToSelect){
      this.selected = [];
      for (var i = 0; i < this.summaryGenes.length; i++) {
        if(i < numberOfGenesToSelect){
          this.summaryGenes[i].inGeneSet = true;
          if(!this.selected.includes(this.summaryGenes[i].name)){
            this.selected.push(this.summaryGenes[i].name);
          }
        }
        else {
          this.summaryGenes[i].inGeneSet = false;
        }
      }
      this.$emit("add_to_gene_set", this.selected)
    },
    selectTopGenesAfterDelete(numberOfGenesToSelect){
      this.selected = [];
      if(this.summaryGenes.length === 0){
        this.selected = [];
      }
      for (var i = 0; i < this.summaryGenes.length; i++) {
        if(i < numberOfGenesToSelect){
          this.summaryGenes[i].inGeneSet = true;
          if(!this.selected.includes(this.summaryGenes[i].name)){
            this.selected.push(this.summaryGenes[i].name);
          }
        }
        else {
          this.summaryGenes[i].inGeneSet = false;
        }
      }
      // this.geneTableLoading = false;

      this.$emit("add_to_gene_set", this.selected);
      this.geneToDelete = null;

    },
    updateGenesTop(e){
      if(this.selectedGenesFlag){
        if(!this.launchedFromGenePanel){
          if(this.genesTop>0 && this.genesTop<51){
            this.selectTopGenes(this.genesTop);
            this.$emit("update_genes_top", this.genesTop);
          }
          else {
            this.deselectAllGenes();
            this.warningDialog = true;
            setTimeout(() => (this.warningDialog = false), 4000);
          }
        }
        else{
          this.selectTopGenes(this.genesTop);
          this.$emit("update_genes_top", this.genesTop);
        }
      }
    },
    EnableToSelectGenes(){
      if(this.genesTop>0 && this.genesTop<51){
        this.selectTopGenes(this.genesTop)
      }
      else {
        this.deselectAllGenes();
        this.warningDialog = true;
        setTimeout(() => (this.warningDialog = false), 4000);
      }
    },
    exportGenesForDownload(){
      this.$emit("exported_genes", {
        summary: this.summaryGenes,
        selected: this.selected,
        exportFlag: false,
      })
    },
    getColumnWidth(resource){
      if(resource === 'gtr') {
        if(this.gtrResourceUsed && this.selectedTab !== 'HPO'){
          return '18%';
        }
        else{
          return '1%';
        }
      }
      if(resource === 'gtr_associated') {
        if(this.gtrResourceUsed && this.selectedTab !== 'HPO'){
          return '7%';
        }
        else{
          return '1%';
        }
      }
      if(resource === 'phenolyzer') {
        if(this.PhenolyzerResourceUsed && this.selectedTab !== 'HPO'){
          return '18%';
        }
        else{
          return '1%';
        }
      }
      if(resource === 'hpo') {
        if(this.hpoResourceUsed){
          return '18%';
        }
        else{
          return '1%';
        }
      }
      else if(resource === 'hpo_score') {
        if(this.hpoResourceUsed && this.selectedTab === 'HPO'){
          return '8%';
        }
        else{
          return '1%';
        }
      }
      if(resource === 'added') {
        if(this.genes !== undefined && this.genes.length > 0 && this.selectedTab !== 'HPO'){
          return '8%';
        }
        else{
          return '1%';
        }
      }
    },
    getColumnName(resource){
      if(resource === 'gtr') {
        if(this.gtrResourceUsed && this.selectedTab !== 'HPO'){
          return 'GTR';
        }
        else{
          return '';
        }
      }
      else if(resource === 'phenolyzer') {
        if(this.PhenolyzerResourceUsed  && this.selectedTab !== 'HPO'){
          return 'Phenolyzer';
        }
        else{
          return '';
        }
      }
      else if(resource === 'hpo') {
        if(this.hpoResourceUsed){
          return 'HPO';
        }
        else{
          return '';
        }
      }
      else if(resource === 'hpo_score') {
        if(this.hpoResourceUsed  && this.selectedTab === 'HPO'){
          return 'Score';
        }
        else{
          return '';
        }
      }
      else if(resource === 'added') {
        if(this.genes !== undefined && this.genes.length > 0  && this.selectedTab !== 'HPO'){
          return 'Added';
        }
        else{
          return '';
        }
      }
      else if(resource === 'gene') {
        if(this.summaryGenes !== undefined && this.summaryGenes.length > 0){
          return 'Gene';
        }
        else{
          return '';
        }
      }
      else if(resource === 'number') {
        if(this.summaryGenes !== undefined && this.summaryGenes.length > 0){
          return 'Number';
        }
        else{
          return '';
        }
      }
    },
    
    getColumnValue(resource){
      if(resource === 'gtr') {
        if(this.gtrResourceUsed && this.selectedTab !== 'HPO'){
          return 'searchTermsGtr';
        }
        else{
          return '';
        }
      }
      else if(resource === 'gtr_associated') {
        if(this.gtrResourceUsed && this.selectedTab !== 'HPO'){
          return 'associatedGenesBadge';
        }
        else{
          return '';
        }
      }
      else if(resource === 'phenolyzer') {
        if(this.PhenolyzerResourceUsed  && this.selectedTab !== 'HPO'){
          return 'searchTermsPhenolyzer';
        }
        else{
          return '';
        }
      }
      else if(resource === 'hpo') {
        if(this.hpoResourceUsed){
          return 'searchTermHpo';
        }
        else{
          return '';
        }
      }
      else if(resource === 'hpo_score') {
        if(this.hpoResourceUsed && this.selectedTab === 'HPO'){
          return 'scaledScore';
        }
        else{
          return '';
        }
      }
      else if(resource === 'isImportedGenes') {
        if(this.genes !== undefined && this.genes.length > 0  && this.selectedTab !== 'HPO'){
          return 'isImportedGenes';
        }
        else{
          return '';
        }
      }
    },
    
    organizeTableHeaders() {
      this.headers = [
        // { text: '', align: 'left', value: 'padding_space', sortable: false, width: '1%'},
        { text: '', align: 'left', value: 'inGeneSet', sortable: false, width: '1%'},
        { text: this.getColumnName('number'), align: 'left', value: 'idx', sortable: false, width: '2%'},
        { text: this.getColumnName('gene'), align: 'left', value: 'name', sortable: false, width: '1%'},
        { text: '', align: 'left', value: this.getColumnValue('gtr_associated'), sortable: false, width: this.getColumnWidth('gtr_associated')},
        { text: this.getColumnName('gtr'), value: this.getColumnValue('gtr'), sortable: false, width: this.getColumnWidth('gtr')},
        { text: this.getColumnName('phenolyzer'), value: this.getColumnValue('phenolyzer'), sortable: false, width: this.getColumnWidth('phenolyzer')},
        { text: this.getColumnName('hpo'), value: 'searchTermHpo', sortable: false, width: this.getColumnWidth('hpo')},
        { text: this.getColumnName('added'), value: this.getColumnValue('isImportedGenes'), sortable: false, width: this.getColumnWidth('added')},
        { text: this.getColumnName('hpo_score'), value: this.getColumnValue('hpo_score'), sortable: false, width: this.getColumnWidth('hpo_score')},
        { text: '', align: 'right', value: 'info', sortable: false, width: '1%'},
        { text: '', align: 'left', value: 'actions', sortable: false, width: '1%'},
      ]
    }

  }

}

</script>

<style lang="sass" scoped>
  body, .v-application
    font-family: 'Poppins', sans-serif

  .v-application--wrap
    font-family: 'Poppins', sans-serif

  .v-btn
    text-transform: none
    letter-spacing: normal

  .i-chips--terms
    font-size: 12px !important
  
  .gene-list-table
    table-layout : fixed
  
  .editTextInput
    margin-bottom: 12px
    width: 65px
    font-size: 16px !important
    font-weight: bolder
    box-sizing: border-box
    border: none
    border-bottom: 1px solid #f0f0f0
    padding-bottom: 10px
    padding-top: 10px
    text-align: center  
    
  .v-data-table__empty-wrapper 
    background: white !important
    
  .table-no-data
    background: white !important  
</style>
