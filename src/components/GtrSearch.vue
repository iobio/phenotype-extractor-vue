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
      HierarchyRelations: null,
      HierarchyParentData: null,
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

      model.promiseGetDiseases(searchTerm, conceptId, this.HierarchyRelations, this.HierarchyParentData)
        .then(function(data){
          console.log("data" , data)
          // createDefinitionsObj(data)
          // dataMain = data;
          // diseases = data.diseases;
          // var promises = [];
          // var filteredDiseases;
          // var maxDiseasesLimit = false;
          // if(diseases.length>70){
          //   maxDiseasesLimit = true;
          //   comeOutOfPromise1(diseases);
          // }
          // else {
          //   if(diseases.length>0){
          //     if(diseases.length>20){
          //       diseases = diseases.slice(0,20);
          //     }
          //     data.diseases.forEach((disease, i) => {
          //       ((ind) =>{
          //         setTimeout(() =>{
          //           var p = model.promiseGetGenePanelsUsingSearchTerm(disease)
          //             .then((data)=>{
          //                 var filteredGenePanels = model.processGenePanelData(data.genePanels);
          //                 data.disease.genePanels = filteredGenePanels;
          //             },
          //             function(error) {
          //               console.log("error", error)
          //             })
          //             promises.push(p);
          //             if(ind===diseases.length-1){
          //               checkPromisesLength(promises);
          //             }
          //         }, 200 + (2000 * ind));
          //       })(i);
          //
          //     })
          //   }
          //   else {
          //     data.diseases = [
          //       {
          //         ConceptId:"",
          //         Title:searchTerm,
          //         Definition: "",
          //         Merged: "",
          //         ModificationDate: "",
          //         SemanticId: "",
          //         SemanticType: "Disease or Syndrome",
          //         Suppressed: "",
          //         ConceptMeta: {
          //           AssociatedGenes: "",
          //           ClinicalFeatures: "",
          //           ModesOfInheritance: "",
          //           OMIM: "",
          //           RelatedDisorders: ""
          //         }
          //       }]
          //     diseases = data.diseases;
          //
          //     data.diseases.forEach((disease, i) => {
          //       ((ind) =>{
          //         setTimeout(() =>{
          //           var p = model.promiseGetGenePanelsUsingSearchTerm(disease)
          //             .then((data)=>{
          //                 var filteredGenePanels = model.processGenePanelData(data.genePanels);
          //                 data.disease.genePanels = filteredGenePanels;
          //             },
          //             function(error) {
          //               console.log("error", error)
          //             })
          //             promises.push(p);
          //             if(ind===diseases.length-1){
          //               checkPromisesLength(promises);
          //             }
          //         }, 200 + (2000 * ind));
          //       })(i);
          //
          //     })
          //   }
          // }
          //
          // var checkPromisesLength = (promises)=>{
          //   Promise.all(promises).then(function(){
          //     if(diseases.length===1 && diseases[0].genePanels===undefined){
          //       comeOutOfPromise();
          //     }
          //     else {
          //       filteredDiseases = model.processDiseaseData(diseases);
          //       if(filteredDiseases.length<1 && diseases.length<8){
          //         filteredDiseases = tryByUsingConceptId();
          //       }
          //       else if(!maxDiseasesLimit){
          //         addFilteredDiseases(filteredDiseases);
          //       }
          //     }
          //   })
          // }
        })
    }
  }
}

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans');

</style>
