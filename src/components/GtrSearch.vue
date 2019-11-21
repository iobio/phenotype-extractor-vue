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

import HierarchyData from '../data/HierarchyData.json';
import HierarchyParentIds from '../data/HierarchyParentIds';

export default {
  components: {
  },
  props: {
  },
  data(){
    return {
      search: "",
      diseaseData : [],
      selectedCondition: {},
      selectedGene: {},
      enterCount: 0,
      DiseaseDataArray: [],
      checked:false,
      alert:false,
      multipleSearchTerms:[],
      filteredDiseasesItems:[],
      snackbar: false,
      snackbarText: "",
      y: 'top',
      x: null,
      mode: '',
      snackbarTimeout: 4000,
      HelpDialogsData: null,
      HierarchyRelations: null,
      HierarchyParentData: null,
      enterPressed: false,
      alertWarning: false,
      singleItemTypeAhead: false,
      enterCount: 0,
      launchedFromClin: false,
      canClearClinGenes: false,
      warningHints: [],
      alertWarningHints: false,
      definitionObj: {},
      tooltipDefinition: null,
      showToolTipDefinition: false,
    }
  },
  mounted(){
    this.HierarchyParentData = HierarchyParentIds;
    this.HierarchyRelations = HierarchyData;

    bus.$on("singleTermSearchGTR", term => {
      this.search = term;
      this.performSearch();
    })
  },
  updated(){

  },
  watch: {
  },
  methods:{
    getConcpetId: function(term){
      var cleanTerm = term.trim().toLowerCase();
      var cID =""
      this.DiseaseNames.map(x=>{
        if(cleanTerm===x.DiseaseName.toLowerCase()){
          cID =  x.ConceptID
        }
      });
      return cID;
    },
    performSearch(){
      var searchTerm ="";
      var conceptId = "";
      if(this.search.DiseaseName!==undefined && this.search.ConceptID===undefined){
        searchTerm = this.search.DiseaseName;
        conceptId = this.getConcpetId(searchTerm);
      }
      else if(this.search.DiseaseName!==undefined){
        searchTerm = this.search.DiseaseName;
        conceptId = this.search.ConceptID;
      }
      else if(this.search.DiseaseName===undefined) {
        searchTerm = this.search.trim();
        conceptId = this.getConcpetId(this.search);
      }

      if(!this.multipleSearchTerms.includes(searchTerm)){
        this.multipleSearchTerms.push(searchTerm);
        var diseases;
        var dataMain;

        model.promiseGetDiseases(searchTerm, conceptId, this.HierarchyRelations, this.HierarchyParentData)
          .then(function(data){
            console.log("data" , data)
            // createDefinitionsObj(data)
            dataMain = data;
            diseases = data.diseases;
            var promises = [];
            var filteredDiseases;
            var maxDiseasesLimit = false;
            if(diseases.length>70){
              maxDiseasesLimit = true;
              comeOutOfPromise1(diseases);
            }
            else {
              if(diseases.length>0){
                if(diseases.length>20){
                  diseases = diseases.slice(0,20);
                }
                data.diseases.forEach((disease, i) => {
                  ((ind) =>{
                    setTimeout(() =>{
                      var p = model.promiseGetGenePanelsUsingSearchTerm(disease)
                        .then((data)=>{
                            var filteredGenePanels = model.processGenePanelData(data.genePanels);
                            data.disease.genePanels = filteredGenePanels;
                            console.log("filteredGenePanels", filteredGenePanels)
                        },
                        function(error) {
                          console.log("error", error)
                        })
                        promises.push(p);
                        if(ind===diseases.length-1){
                          checkPromisesLength(promises);
                        }
                    }, 200 + (2000 * ind));
                  })(i);

                })
              }
              else {
                data.diseases = [
                  {
                    ConceptId:"",
                    Title:searchTerm,
                    Definition: "",
                    Merged: "",
                    ModificationDate: "",
                    SemanticId: "",
                    SemanticType: "Disease or Syndrome",
                    Suppressed: "",
                    ConceptMeta: {
                      AssociatedGenes: "",
                      ClinicalFeatures: "",
                      ModesOfInheritance: "",
                      OMIM: "",
                      RelatedDisorders: ""
                    }
                  }]
                diseases = data.diseases;

                data.diseases.forEach((disease, i) => {
                  ((ind) =>{
                    setTimeout(() =>{
                      var p = model.promiseGetGenePanelsUsingSearchTerm(disease)
                        .then((data)=>{
                            var filteredGenePanels = model.processGenePanelData(data.genePanels);
                            data.disease.genePanels = filteredGenePanels;
                        },
                        function(error) {
                          console.log("error", error)
                        })
                        promises.push(p);
                        if(ind===diseases.length-1){
                          checkPromisesLength(promises);
                        }
                    }, 200 + (2000 * ind));
                  })(i);

                })
              }
            }

            var checkPromisesLength = (promises)=>{
              Promise.all(promises).then(function(){
                if(diseases.length===1 && diseases[0].genePanels===undefined){
                  comeOutOfPromise();
                }
                else {
                  filteredDiseases = model.processDiseaseData(diseases);
                  if(filteredDiseases.length<1 && diseases.length<8){
                    filteredDiseases = tryByUsingConceptId();
                  }
                  else if(!maxDiseasesLimit){
                    addFilteredDiseases(filteredDiseases);
                  }
                }
              })
            }
          })

          var callAfunction = (promises)=>{
            var filteredDiseases;
            Promise.all(promises).then(function(){
              if(diseases.length===1 && diseases[0].genePanels===undefined){
                comeOutOfPromise();
              }
              else {
                filteredDiseases = model.processDiseaseData(diseases);
                if(filteredDiseases.length<1){
                  filteredDiseases = tryByUsingConceptId();
                }
                else {
                  addFilteredDiseases(filteredDiseases);
                }
              }
            })
          }

          var comeOutOfPromise =()=>{
            this.alert = true;
            this.checked=false;
            bus.$emit("hideContentLoader");
            bus.$emit("completeFetchRequest", "noGenePanels");
          }

          var comeOutOfPromise1 =(diseases)=>{
            bus.$emit("handleGeneralTermsInSingleEntry", diseases);
            this.warningHints = diseases.slice(3, 7);
            this.alertWarningHints = true
            this.checked=false;
            bus.$emit("hideContentLoader");
            this.remove(this.search)
            this.alert = false;
          }

          var createDefinitionsObj = (data)=>{
            searchTerm = data.searchTerm;
            if(this.definitionObj[searchTerm]===undefined && data.diseases.length>0){
              if(data.diseases[0].Title === searchTerm && data.diseases[0].Definition.length>10){
                this.definitionObj[searchTerm] = data.diseases[0].Definition;
              }
            }
          }



          var tryByUsingConceptId = () =>{
            var promises1 = [];
            dataMain.diseases.forEach(function (disease){
              var p = model.promiseGetGenePanels(disease)
              .then(function (dataMain){
                  var filteredGenePanels = model.processGenePanelData(dataMain.genePanels);
                  dataMain.disease.genePanels = filteredGenePanels;
              },
              function(error) {
                console.log("error", error)
              })
               promises1.push(p);
            })

            Promise.all(promises1).then(function(){
               var a  = model.processDiseaseData(diseases);
               addFilteredDiseases(a);
            })
          }

          var x = [];

          var addFilteredDiseases = (filteredDiseases) =>{
            if (filteredDiseases.length===0) {
              this.alert= true;
              bus.$emit("completeFetchRequest", "noGenePanels");
              this.checked=false;
              bus.$emit("hideContentLoader");
            }
            else{
              this.checked=false;
              bus.$emit("hideContentLoader");
              bus.$emit("completeFetchRequest", "GTR");
            }
            if(this.multipleSearchTerms.includes(searchTerm)){ //this avoids adding an index when the term is deleted
              filteredDiseases.map(x=>{
                x["searchTerm"]="ip"+searchTerm+"ip";
                x["searchTermArray"] = [searchTerm];
                x["searchTermIndex"] = [this.multipleSearchTerms.indexOf(searchTerm)+1];
                this.filteredDiseasesItems.push(x);
              });
              this.$emit("searchTermDiseases", filteredDiseases)
            }

            if(this.multipleSearchTerms.includes(searchTerm)){
              bus.$emit("newSearch")
              console.log("filteredDiseasesItems", this.filteredDiseasesItems)
              this.$emit('filteredDiseasesItems', this.filteredDiseasesItems);
              this.filteredDiseasesItems = [];
              filteredDiseases = null;
            }

          }

      }

    }
  }
}

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans');

</style>
