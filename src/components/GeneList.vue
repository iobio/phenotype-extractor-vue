<template>
  <v-container style="margin-top:-35px">

    <div class="row">
      <div class="col-md-12">
        <v-card>
          <div id="gene-data-table" >
            <v-card-title>
              <strong>Genes</strong>
              <VennDiagram
                :vennData="vennData">
              </VennDiagram>

              <v-spacer></v-spacer>
              <div class="row">
                <div class="col-md-7"></div>
                <div class="col-md-4">
                  <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Find gene"
                    single-line
                    hide-details
                  ></v-text-field>
                </div>
                <div class="col-md-1 "></div>
              </div>
              <v-dialog v-model="copyPasteGenes" max-width="500px">
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" class="mr-3 mt-3" v-on="on">
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
                    <v-btn style="float:right" @click.native="copyPasteGenes = false, genesToApply = null">
                      Cancel
                    </v-btn>
                    <v-btn style="float:right" @click.native="onApplyGenes">
                      Apply
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
            >
              <template v-slot:item.name="{ item }">
                <div style="width:140px" @mouseover="mouseOverGeneName(item.name)" @mouseleave="mouseLeaveGeneName">
                  <v-chip @click="showGeneInfo(item.name)"  dark>{{ item.name }}</v-chip>
                  <span v-if="item.isAssociatedGene!==undefined && item.isAssociatedGene===true"> <v-icon class="ml-1" style="font-size:20px" color="primary">verified_user</v-icon></span>
                  <!-- <span v-if="hoveredGeneName===item.name" class="ml-1" > -->
                  <span class="ml-2" >
                    <v-icon color="red lighten-2" small @click="checkBeforeDeleteGene(item)" style="font-size:18px">
                      far fa-times-circle
                    </v-icon>
                  </span>
                </div>
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
            <v-btn color="primary" text @click="cancelDeleteGene">No</v-btn>
            <v-btn color="primary" text @click="deleteGene">Yes</v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>
      <!--End Modal to confirm gene deletion -->

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
import hpo_genes from '../data/hpo_genes.json';
import Phenotypes from './Phenotypes.vue';
import VennDiagram from './VennDiagram.vue'

export default {
  name: 'GeneList',
  components: {
    Phenotypes,
    VennDiagram
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
    }
  },
  watch:{
    summaryGeneList(){
      // this.summaryGenes = this.summaryGeneList;
      this.organizeGeneList();
    },
    phenotypeTerms(){
      this.phenotypes = this.phenotypeTerms
    },
    venn_diag_data(){
      this.vennData = this.venn_diag_data;
    }
  },
  data () {
    return {
      search: '',
      summaryGenes: [],
      headers: [
        { text: 'Gene', align: 'left', value: 'name', sortable: false, },
        { text: 'GTR', value: 'searchTermsGtr', sortable: false, },
        { text: 'Phenolyzer', value: 'searchTermsPhenolyzer', sortable: false, },
        { text: 'HPO', value: 'searchTermHpo', sortable: false, },
        { text: 'Added', value: 'isImportedGenes', sortable: false, },
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
    }
  },

  mounted(){
    // console.log("genelist mounted");
    this.knownGenesData = knownGenes;
    // this.summaryGenes = this.summaryGeneList;
    this.organizeGeneList();

    this.HpoGenesData = hpo_genes;
    this.HpoTermsTypeaheadData  = HpoTermsData.data;
    this.HPO_Terms_data = HPO_Terms;
    this.HPO_Phenotypes_data = HPO_Phenotypes;
    this.vennData = this.venn_diag_data
  },

  created(){
    // console.log("genelist created");
    bus.$on("show-gene-table-skeleton-loaders", ()=>{
      this.geneTableLoading = true;
    });

    bus.$on("hide-gene-table-skeleton-loaders", ()=>{
      this.geneTableLoading = false;
    });

    this.phenotypes = this.phenotypeTerms;

  },

  updated(){
    // console.log("genelist updated");
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
      let idx = this.summaryGenes.findIndex(x => x.name === this.geneToDelete.name);
      this.summaryGenes.splice(idx, 1)
      this.deleteGeneDialog = false;
      this.$emit("UpdateListOnDelete", this.summaryGenes)
    },

    getPhenotypFromHPO_id(id){
      var idx = this.HPO_Terms_data.indexOf(id);
      var phenotype = this.HPO_Phenotypes_data[idx];
      return `${phenotype} [ ${id} ]`
    },

    organizeGeneList(){
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

</style>
