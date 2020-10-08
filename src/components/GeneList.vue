<template>
  <v-container style="margin-top:-35px">

    <div class="row">
      <div class="col-md-12">
        <v-card>
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
                v-show="summaryGenes.length"
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
                          v-on:input="updateGenesTop"
                          >
                        <span class="ml-1">gene<span v-if="genesTop>1">s</span> selected
                          <span>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-icon v-on="on" style="font-size:18px; opacity: 0.8">info_outline</v-icon>
                              </template>
                              <span>
                                All variants in the genes selected here will be analyzed in the Review Variants step.
                                <br>
                                You can manually add or remove genes from the list, or choose the top N genes (20 by default) to analyse.</span>
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
                <div class="col-md-1"></div>

                <div class="col-md-3">
                  <div>
                    <v-text-field
                      v-model="search"
                      append-icon="search"
                      label="Find gene"
                      single-line
                      hide-details
                    ></v-text-field>
                  </div>
                </div>
                <div class="col-md-1 "></div>
              </div>
              <v-dialog v-model="copyPasteGenes" max-width="500px">
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" class="mr-3" :class="{'mt-3' : !summaryGenes.length }" v-on="on">
                    <v-icon class="mr-1">add</v-icon>
                    Add
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title primary-title>
                  </v-card-title>
                  <v-card-text>
                    <div id="enter-genes-input">
                      <v-textarea
                        id="copy-paste-genes"
                        multi-line
                        rows="10"
                        outlined
                        label="Enter gene names"
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
                    <v-btn style="float:right" @click.native="copyPasteGenes = false, genesToApply = null">
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
            >
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

export default {
  name: 'GeneList',
  components: {
    Phenotypes,
    VennDiagram, 
    GeneCard
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
      this.organizeGeneList();
    },
    phenotypeTerms(){
      this.phenotypes = this.phenotypeTerms
    },
    venn_diag_data(){
      this.vennData = this.venn_diag_data;
    },
    genesTop(){
      console.log("genesTop is changing", this.genesTop);
    }
  },
  data () {
    return {
      search: '',
      summaryGenes: [],
      headers: [
        // { text: '', align: 'left', value: 'padding_space', sortable: false, width: '1%'},
        { text: '', align: 'left', value: 'inGeneSet', sortable: false, width: '2%'},
        { text: 'Gene', align: 'left', value: 'name', sortable: false, width: '1%'},
        { text: '', align: 'left', value: 'associatedGenesBadge', sortable: false, width: '7%'},
        { text: 'GTR', value: 'searchTermsGtr', sortable: false, width: '18%'},
        { text: 'Phenolyzer', value: 'searchTermsPhenolyzer', sortable: false, width: '18%'},
        { text: 'HPO', value: 'searchTermHpo', sortable: false, width: '18%'},
        { text: 'Added', value: 'isImportedGenes', sortable: false, width: '8%'},
        { text: '', align: 'right', value: 'info', sortable: false, width: '1%'},
        { text: '', align: 'left', value: 'actions', sortable: false, width: '1%'},
      ],
      clickedGene: {},
      ncbiSummary: null,
      dialog: false,
      genes:[],
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
    }
  },

  mounted(){
    console.log("mounted");
    this.knownGenesData = knownGenes;
    // this.summaryGenes = this.summaryGeneList;
    
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

    this.phenotypes = this.phenotypeTerms;

  },

  updated(){
    console.log("updated");
    console.log("this.genesTop", this.genesTop);
    console.log("selectedgenes", this.selected);
    console.log("selectedGenesForGeneSet", this.selectedGenesForGeneSet);
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
      this.copyPasteGenes = false;
      this.dupGenes= "",
      this.byPassedGenes = "";
      this.genesToApply = this.genesToApply.trim().replace(/\n/g, " ").replace(/,/g, " ").replace(/\s+/g, " ");
      var arr = this.genesToApply.split(" ");
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
      // this.$emit("UpdateListOnDelete", this.summaryGenes)
      // let idx = this.summaryGenes.findIndex(x => x.name === this.geneToDelete.name);
      // this.summaryGenes.splice(idx, 1)
    },

    getPhenotypFromHPO_id(id){
      var idx = this.HPO_Terms_data.indexOf(id);
      var phenotype = this.HPO_Phenotypes_data[idx];
      return `${phenotype} [ ${id} ]`
    },
    
    organizeGeneListOnMount(){
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
          gene.idx = idx;
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
      console.log("organizeGeneList called", this.genesTop);
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

        // if(this.summaryGenes.length < 20){
        //   this.genesTop = this.summaryGenes.length;
        // }
        // else {
        //   this.genesTop = 20;
        // }
        this.selectTopGenes(this.genesTop);
        
      }
      else {
        this.summaryGenes = [];
      }
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
    updateGenesTop(e){
      if(this.selectedGenesFlag){
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
</style>
