<template>
  <div>
  </div>
</template>


<script>
import { bus } from '../main';

import jQuery from 'jquery';
global.jQuery = jQuery;
global.$ = jQuery;

import Model from '../models/Model';
var model = new Model();

import GeneModel from '../models/GeneModel';
var geneModel = new GeneModel();

import HPO_Phenotypes from '../data/HPO_Phenotypes';
import HPO_Terms from '../data/HPO_Terms';
import HpoTermsData from '../data/HpoTermsData.json';
// import hpo_genes from '../data/hpo_genes.json';

export default {
  components: {
  },
  props: {
  },
  data(){
    let self = this;
    return {
      notes: "",
      HpoTerms: [],
      multipleSearchTerms: [],
      checked: false,
      HpoGenesData: null,
      HpoTermsTypeaheadData: null,
      items: [],
      selected: [],
      confirmationDialog: false,
      loadingDialog: false,
      //DataTable
      pagination: {
        sortBy: 'index',
        // descending: true,
        rowsPerPage: 25
      },
      search: '',
      searchInput: "",
      selected: [],
      confirmationItems: [],
      confirmationSelected: [],
      openSearchBox: false,
      search: '',
      submitButtonEnabled: false,
      sliderValue: 1,
      minSliderValue: 1,
      maxSliderValue: 1,
      sliderColor: 'grey lighten-1',
      color: 'blue darken-3',
      HPO_Phenotypes_data: null,
      HPO_Terms_data: null,
      snackbar: false,
      snackbarText: "",
      y: 'top',
      x: null,
      mode: '',
      snackbarTimeout: 4000,
      hpoGenesSearchTermObj: {},
    }
  },

  mounted(){
    // this.HpoGenesData = hpo_genes;
    fetch('https://s3.amazonaws.com/ped.test.files/hpo_genes.json')
      .then( res => res.json())
        .then( data => {
          this.HpoGenesData = data;
          console.log("this.HpoGenesData", this.HpoGenesData);
        })
    this.HpoTermsTypeaheadData  = HpoTermsData.data;
    this.HPO_Terms_data = HPO_Terms;
    this.HPO_Phenotypes_data = HPO_Phenotypes;

    bus.$on("singleTermSearchHPO", (x)=>{
      this.searchInput = x;
      this.checked = false;
      this.searchForTheInputTerm();
    })

    bus.$on("removeHpoTerm", (term) => {
      this.remove(term);
    })

  },


  methods:{

    remove(term){
      var idx = this.multipleSearchTerms.indexOf(term.hpoNumber);
      this.HpoTerms.splice(idx,1);
      this.HpoTerms = [...this.HpoTerms];
      this.multipleSearchTerms.splice(idx,1);
      this.multipleSearchTerms = [...this.multipleSearchTerms];
      // this.$emit("clinphenTerms", this.HpoTerms);
      this.getGenesForHpoTerms();
    },

    searchForTheInputTerm(){
      // bus.$emit("clearSearchInput");
      this.checked = true;
      // var inputString = document.getElementById("hpo_input").value;
      var inputString = this.searchInput.HPO_Data
      inputString = inputString.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

      var cleanedInputString;
      var idx;
      var hpoId;
      var phenoTerm;

      if(this.searchInput===undefined){ //If the input is not selected from the typeahead
        if(inputString.substr(0,2).toUpperCase() === "HP"){ //Check if the input is in HP: format
          cleanedInputString = [inputString.slice(0,2), ":" , inputString.slice(2)].join('');
          cleanedInputString = cleanedInputString.toUpperCase();
          if(this.HPO_Terms_data.includes(cleanedInputString)){
            idx = this.HPO_Terms_data.indexOf(cleanedInputString);
            hpoId = cleanedInputString;
            phenoTerm = this.HPO_Phenotypes_data[idx];
            if(!this.multipleSearchTerms.includes(hpoId)){
              this.getIndividualGenes(hpoId);
              this.multipleSearchTerms.push(hpoId);
              this.HpoTerms.push(
                {
                  hpoNumber:hpoId,
                  phenotype:phenoTerm
                }
              )
              this.getGenesForHpoTerms();
            }
          }
          else {
            this.snackbarText = "Please select an option from the autocomplete";
            this.snackbar = true;
            this.checked = false;
          }
        }
        else { //checks if the input is a phenotype term
          cleanedInputString = model.capitalizeFirstLetter(inputString.toLowerCase());
          if(this.HPO_Phenotypes_data.includes(cleanedInputString)){
            idx = this.HPO_Phenotypes_data.indexOf(cleanedInputString);
            phenoTerm = cleanedInputString;
            hpoId = this.HPO_Terms_data[idx];
            if(!this.multipleSearchTerms.includes(hpoId)){
              this.getIndividualGenes(hpoId);
              this.multipleSearchTerms.push(hpoId);
              this.HpoTerms.push(
                {
                  hpoNumber:hpoId,
                  phenotype:phenoTerm
                }
              )
              this.getGenesForHpoTerms();
            }
          }
          else {
            this.snackbarText = "Please select an option from the autocomplete";
            this.snackbar = true;
            this.checked = false;
          }
        }
      }
      else { //If the input is selected from the typeahead
        var res = this.searchInput.HPO_Data.split(" - ");
        hpoId = res[1].replace(/[\])}[{(]/g, '').trim();
        phenoTerm = res[0];
        if(!this.multipleSearchTerms.includes(hpoId)){
          this.getIndividualGenes(hpoId);
          this.multipleSearchTerms.push(hpoId);
          bus.$emit('AddHpoTermsInSingleEntry', {
            HPO_Data: this.searchInput.HPO_Data,
            hpoNumber:hpoId,
            phenotype:phenoTerm
          })
          this.HpoTerms.push(
            {
              hpoNumber:hpoId,
              phenotype:phenoTerm
            }
          )
          this.getGenesForHpoTerms();
        }
        else {
          this.snackbarText = "This HPO Term already exists";
          this.snackbar = true;
          this.checked = false;
        }
      }
    },

    getGenesForHpoTerms: function(){
      // bus.$emit("clearSearchInput");
      var genes = [];
      this.items = [];
      this.selected = [];
      this.$emit("clinphenTerms", this.HpoTerms);
      this.multipleSearchTerms.map((term, i)=>{
        if(this.HpoGenesData[term]!==undefined){
          this.HpoGenesData[term].gene_symbol.map(gene_name=>{
            if(!genes.includes(gene_name)){
              genes.push(gene_name);
              this.items.push({
                gene: gene_name,
                searchTermIndex: [i+1],
                hpoTerm: [term],
                componentSource: "ClinPhen",
                hpoSource:1,
              })
            }
            else if(genes.includes(gene_name)){
              var idx = genes.indexOf(gene_name);
              if(this.items[idx].hpoTerm!==term){
                this.items[idx].searchTermIndex.push(i+1);
                this.items[idx].hpoTerm.push(term);
                this.items[idx].hpoSource = this.items[idx].hpoSource+1;
              }
            }
          })
        }
      })
      // console.log("HpoGenesData", this.HpoGenesData)
      this.checked = false;
      this.items.sort((a,b)=> b.hpoSource - a.hpoSource );
      this.noOfSourcesSvg();
      // this.selectGenes();
      // console.log("items in hpo", this.items)
      this.$emit("HpoFullGeneList", this.items)
      bus.$emit("completeFetchRequest", "hpo");
    },

    noOfSourcesSvg: function(){
      this.items.map((x, i)=>{
        x.index = i+1;
        x.searchTermIndexSVG = x.searchTermIndex.map(y=>{
          return `<svg height="30" width="30">
                <circle class="sourceIndicator"/>
                <text class="sourceIndicatorText" x="12" y="15" font-weight="600" font-size="10"  dy=".3em">${y}</text>
              </svg> `
        })
        x.omimSrc = `https://www.ncbi.nlm.nih.gov/omim/?term=${x.gene}`;
        x.medGenSrc = `https://www.ncbi.nlm.nih.gov/medgen/?term=${x.gene}`;
        x.geneCardsSrc = `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${x.gene}`;
        x.ghrSrc = `https://ghr.nlm.nih.gov/gene/${x.gene}`;
        x.clinGenLink = `https://www.ncbi.nlm.nih.gov/projects/dbvar/clingen/clingen_gene.cgi?sym=${x.gene}`;

      });
    },

    getIndividualGenes(term){
      var genes = [];
      var individualGenes= [];
      if(this.hpoGenesSearchTermObj[term]===undefined){
        if(this.HpoGenesData[term]!==undefined){
          this.HpoGenesData[term].gene_symbol.map(gene_name=>{
            if(!genes.includes(gene_name)){
              genes.push(gene_name);
              individualGenes.push({
                gene: gene_name,
                hpoTerm: [term],
                componentSource: "ClinPhen",
              })
            }
          })
        }
      }
      this.hpoGenesSearchTermObj[term] = individualGenes;
      bus.$emit("completeHpoFetchRequest", term)
      this.$emit("individualGenesObjHpo", this.hpoGenesSearchTermObj)
    },

  },

}

</script>
