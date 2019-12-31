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


export default {
  components: {
  },
  props: {
  },
  data(){
    let self = this;
    return{
      showGenesMenu: null,
      enterCount: 0,
      genesToApply: null,
      genesTopCounts: [5, 10, 30, 50, 80, 100],
      phenolyzerTopCounts: [30, 50, 80, 100],
      phenolyzerTop: 50,
      phenotypeTerm: "",
      phenotypeTermEntered: "",
      allPhenotypeTerms: [],
      phenolyzerStatus: null,
      hpoLookupUrl:  "https://nv-prod.iobio.io/hpo/hot/lookup/?term=",
      typeaheadLimit: parseInt(100),
      geneList: [],
      //DataTable
      search: '',
      selected: [],
      tempItems: [],
      items: [],
      sortItems: [],
      NumberOfTopPhenolyzerGenes: 50,
      selectedGenesText: "",
      checked: false,
      alert:false,
      snackbar: false,
      snackbarText: "",
      multipleSearchTerms: [],
      multipleSearchArray: [],
      y: 'top',
      x: null,
      mode: '',
      snackbarTimeout: 4000,
      dictionaryArr: [],
      noResultsArr: [],
      pieChartdataArr: [],
      phenotypeSearchedByUser: false,
      chartComponent: null,
      genesTopCounts: [5, 10, 30, 50, 80, 100],
      dialog: false,
      IntroductionTextData: null,
      HelpDialogsData: null,
      DisorderFromGtr: "",
      includeClinPhenolyzerGenes: true,
      openSearchBox: false,
      openEditBoxPhenolyzer: false,
      genesSearchTermObj: {},
      scoreBasedSort: false,
      sourceBasedSort: true,
    }
  },
  mounted(){
    bus.$on("singleTermSearchPhenolyzer", (x) =>{
      this.phenotypeTerm = {
        id: x,
        label: x,
        value: x,
      }
      this.getPhenotypeDataSearch();
    })

    bus.$on("stopPhenolyzerQueued", (term) => {
      geneModel.StopAjaxCall(term);
      bus.$emit("StoppedPhenolyzerFetchRequest", term)
    })

    bus.$on("removePhenolyzerTerm", (item)=>{
      this.remove(item);
    })
  },
  methods:{

    remove(item) {
      bus.$emit("clearSearchInput");
      this.scoreBasedSort = true;
      this.sourceBasedSort = false;
      this.items = [];
      this.selected = [];
      this.search = '';
      this.openSearchBox = false;
      this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(item), 1)
      this.multipleSearchTerms = [...this.multipleSearchTerms];
      this.dictionaryArr = this.dictionaryArr.filter(term=>term.name!==item);
      // this.$emit('phenotypeSearchTermArray', this.multipleSearchTerms);
      var combinedList = this.combineList(this.dictionaryArr);
      var createdObj = this.createObj(combinedList);
      var averagedData = this.performMeanOperation(combinedList, createdObj);
      var meanData = this.getMeanData(averagedData, this.multipleSearchTerms.length)
      var sortedPhenotypeData = this.sortTheOrder(meanData);
      // var sortedPhenotypeData = this.sortTheOrder(averagedData);

      if(this.multipleSearchTerms.length>0){
        // let data = this.drawSvgBars(sortedPhenotypeData);
        var rankedList = this.rankTheList(sortedPhenotypeData)
        // let data = self.drawSvgBars(sortedPhenotypeData);
        let data = this.drawSvgBars(rankedList);
        this.items = data;
        this.noOfSourcesSvg();
        this.items.map(x=>{
          x.individualRank = this.getRankForEachTerm(x.geneName)
        })

        if(this.launchedFromClin){
          this.selected = this.items.slice(0,10);
        }
        else {
          this.selected = this.items.slice(0,this.genesTop);
        }
        this.phenolyzerStatus = null;
        this.selectedGenesText= ""+ this.selected.length + " of " + this.items.length + " genes selected";
        this.$emit("UpdatePhenolyzerSelectedGenesText", this.selectedGenesText);
        this.$emit("NoOfGenesSelectedFromPhenolyzer", this.selected.length);
        this.$emit("SelectedPhenolyzerGenesToCopy", this.selected);
        this.$emit("PhenolyzerFullGeneList", this.items);
      }
      else {
        this.items = [];
        this.selected = [];
        this.phenolyzerStatus = null;
        this.selectedGenesText= ""+ this.selected.length + " of " + this.items.length + " genes selected";
        this.$emit("UpdatePhenolyzerSelectedGenesText", this.selectedGenesText);
        this.$emit("NoOfGenesSelectedFromPhenolyzer", this.selected.length);
        this.$emit("SelectedPhenolyzerGenesToCopy", this.selected);
        this.$emit("PhenolyzerFullGeneList", this.items);
      }
    },

    getPhenotypeDataSearch(){
      let self = this;
      var searchTerm = self.phenotypeTerm.value;
      if(!self.multipleSearchTerms.includes(searchTerm)){
        self.phenotypeTermEntered = self.phenotypeTerm.value;
        self.selectedGenesText = "";
        self.phenolyzerStatus = null;
        // self.updatePhenolyzerStatusGlobal(null);
        self.genesToApply = "";
        self.NoOfGenesSelectedFromPhenolyzer = 0;
        // if(!self.launchedFromClin){
        //   this.$emit("SelectedPhenolyzerGenesToCopy", this.selected);
        //   this.$emit("PhenolyzerFullGeneList", this.items);
        // }
        self.phenotypeTermEntered = self.phenotypeTerm.value;
        geneModel.newSearchCall(searchTerm);
        geneModel.searchPhenolyzerGenes(searchTerm, this.phenolyzerTop,
        (status, error)=> {
          if (status == 'done') {
            if (geneModel.phenolyzerGenes.length == 0) {
              self.phenolyzerStatus = "no genes found."
              // this.updatePhenolyzerStatusGlobal("no genes found.");
              self.genesToApply = "";
              self.checked = false;
              self.alert = true;
              if(!self.noResultsArr.includes(searchTerm)) {
                // if(searchTerm!=="pqrst"){
                //   self.noResultsArr.push(searchTerm);
                // }
                // bus.$emit("completeFetchRequest", "noPhenolyzerGenes");
                bus.$emit("NoGenesPhenolyzerRequest", searchTerm);
              }
            } else {
              self.tempItems = geneModel.phenolyzerGenes;
              // console.log("phenolyzer self.tempItems", self.tempItems)
              this.$emit("phenolyzerIndividualGenes", self.tempItems)
              self.multipleSearchTerms.push(searchTerm);
              // self.updateTableHeaders();
              self.checked = false;
              self.alert = false;
              self.dictionaryArr.push(({
                name: searchTerm,
                data: self.tempItems
              }))
              if(self.genesSearchTermObj[searchTerm]===undefined){
                self.genesSearchTermObj[searchTerm] = [];
              }

              if(!self.genesSearchTermObj[searchTerm].length){
                self.tempItems.map(x=>{
                  self.genesSearchTermObj[searchTerm].push({
                    name: x.geneName,
                    rank: x.rank,
                    score: x.score
                  })
                })
              }
              this.$emit("individualGenesObjPhenolyzer", self.genesSearchTermObj)
              // console.log("individualGenesObjPhenolyzer", self.genesSearchTermObj)
              self.scoreBasedSort? self.sortScores() : self.sortSources();
              // bus.$emit("completeFetchRequest", "Phenolyzer")
              bus.$emit("completePhenolyzerFetchRequest", searchTerm)
              //event that individual search is complete
            }
          } else {
            self.phenolyzerStatus = status;
            bus.$emit("RunningPhenolyzerFetchRequest", searchTerm)
            // console.log("self.phenolyzerStatus: ", self.phenolyzerStatus, " searchTerm: ", searchTerm)
            // self.updatePhenolyzerStatusGlobal(status);
          }
        });
      }
      else if(self.multipleSearchTerms.includes(searchTerm)){
        self.checked = false;
        self.snackbarText = "This search term has already be entered.";
        self.snackbar = true;
      }
    },
    combineList(arr){
      var temp =[];
        for(var i=0; i<arr.length; i++){
          for(var j=0; j<arr[i].data.length; j++){
            temp.push({
              geneName: arr[i].data[j].geneName,
              geneId: arr[i].data[j].geneId,
              geneIntoleranceScore: arr[i].data[j].geneIntoleranceScore,
              score: Number(arr[i].data[j].score),
              fullScore: Number(arr[i].data[j].score),
              searchTerm: [arr[i].name],
              searchTermIndex: [this.multipleSearchTerms.indexOf(arr[i].name)+1]
            })
          }
        }
        return temp;
    },
    createObj(arr){
      let obj={};
      for(var i=0; i<arr.length; i++){
        if(obj[arr[i].geneName]===undefined){
          obj[arr[i].geneName] = 1;
        }
        else {
          obj[arr[i].geneName]++;
        }
      }
      var uniqueGenes = Object.keys(obj);
      return uniqueGenes
    },
    performMeanOperation: function(arr, uniqueGenes){
      var obj ={};
      for(var i=0; i<uniqueGenes.length; i++){
        for(var j=0; j<arr.length; j++){
          if(uniqueGenes[i]===arr[j].geneName){
            if(obj[uniqueGenes[i]]===undefined){
              obj[uniqueGenes[i]]= {
                geneName: arr[j].geneName,
                // score: Number(arr[j].score),
                total: Number(arr[i].score),
                fullScore: Number(arr[j].score),
                sources: 1,
                searchTerm: arr[j].searchTerm,
                searchTermIndex: arr[j].searchTermIndex,
                geneId: arr[j].geneId,
              }
            }
            else {
              obj[uniqueGenes[i]]= {
                geneName: arr[j].geneName,
                geneId: arr[j].geneId,
                total: Number(obj[uniqueGenes[i]].total) + Number(arr[j].Score),
                fullScore: Number(Number(obj[uniqueGenes[i]].fullScore + Number(arr[j].fullScore))),
                // score: (Number(Number(obj[uniqueGenes[i]].score + Number(arr[j].score)))),
                // score: (Number(Number(obj[uniqueGenes[i]].score + Number(arr[j].score)))/(Number(obj[uniqueGenes[i]].sources) + 1)),
                // score: Number(Number(obj[uniqueGenes[i]].fullScore + Number(arr[j].fullScore)))/(Number(obj[uniqueGenes[i]].sources) + 1),
                sources: Number(obj[uniqueGenes[i]].sources) + 1,
                searchTerm: [...obj[uniqueGenes[i]].searchTerm, ...arr[j].searchTerm],
                searchTermIndex: [...obj[uniqueGenes[i]].searchTermIndex, ...arr[j].searchTermIndex]
              }
            }
          }
        }
      }
      var withAvgArr = Object.values(obj);
      return withAvgArr;
      // sortTheOrder(withAvgArr)
    },
    getMeanData(arr, n){
      arr.map(x=>{
        x.score = Number(x.fullScore/n);
      })
      return arr;
    },
    sortTheOrder(arr){
      arr.sort(function(a,b){
        if (a.score===b.score){
           return (b.score-a.score);
        } else if(a.score<b.score){
           return 1;
        } else if(a.score>b.score){
           return -1;
        }
      })
      return arr;
    },
    rankTheList(arr){
      for(var i=0; i<arr.length; i++){
        arr[i].rank = i+1;
      }
      return arr;
    },
    dataForPieChart(arr){
      var obj = {};
      for(var i=0; i<arr.length; i++){
        if(obj[arr[i].sources]===undefined){
          obj[arr[i].sources] = 1;
        }
        else {
          obj[arr[i].sources]++;
        }
      }
      var dataArray = [];
      var textToAppend = "Genes present in ";
      for (var data in obj){
        dataArray.push({
          name: textToAppend + data + " sources",
          count: obj[data]
        })
      }
      return dataArray;
    },
    createDictionaryOfSearches(){
      this.multipleSearchTerms.push(this.phenotypeTerm.value);
      var dictionaryObj = [];
      for(var i=0; i<this.multipleSearchTerms.length; i++){
        dictionaryObj.push({
          name: this.multipleSearchTerms[i],
          data: this.getPhenotypeData(this.multipleSearchTerms[i])
        })
      }
    },
    sortSources(){
      let self = this;
      self.sourceBasedSort = true;
      self.scoreBasedSort = false;
      var combinedList = self.combineList(self.dictionaryArr);
      var createdObj = self.createObj(combinedList);
      var averagedData = self.performMeanOperation(combinedList, createdObj);
      var meanData = self.getMeanData(averagedData, self.multipleSearchTerms.length)
      var sortedPhenotypeData = self.sortTheOrder(meanData);
      self.pieChartdataArr = self.dataForPieChart(sortedPhenotypeData)
      sortedPhenotypeData = sortedPhenotypeData.sort((a,b)=> b.sources - a.sources );
      var rankedList = self.rankTheList(sortedPhenotypeData)
      // let data = self.drawSvgBars(sortedPhenotypeData);
      let data = self.drawSvgBars(rankedList);
      self.items = data;

      self.noOfSourcesSvg();
      self.items.map(x=>{
        x.individualRank = self.getRankForEachTerm(x.geneName)
      })

      // if(self.includeClinPhenolyzerGenes && self.clinGenes.length>0){
      //   self.selected = [];
      // // if(self.launchedFromClin && self.clinGenes.length>0){
      //   self.items.map(x=>{
      //     if(self.clinGenes.includes(x.geneName)){
      //       self.selected.push(x);
      //     }
      //   })
      // }
      // else {
      //   self.selected = self.items.slice(0, self.genesTop);
      //
      // }
      // self.selected = self.items.slice(0,50);
      self.phenolyzerStatus = null;
      // self.updatePhenolyzerStatusGlobal(null);
      self.selectedGenesText= ""+ self.selected.length + " of " + self.items.length + " genes selected";
      self.$emit("UpdatePhenolyzerSelectedGenesText", self.selectedGenesText);
      self.$emit("NoOfGenesSelectedFromPhenolyzer", self.selected.length);
      self.$emit("SelectedPhenolyzerGenesToCopy", self.selected);
      this.$emit("PhenolyzerFullGeneList", this.items);
      // console.log("PhenolyzerFullGeneList", this.items);

    },
    sortScores(){
      let self = this;
      self.scoreBasedSort = true;
      self.sourceBasedSort = false;
      var combinedList = self.combineList(self.dictionaryArr);
      var createdObj = self.createObj(combinedList);
      var averagedData = self.performMeanOperation(combinedList, createdObj);
      var meanData = self.getMeanData(averagedData, self.multipleSearchTerms.length)
      var sortedPhenotypeData = self.sortTheOrder(meanData);
      self.pieChartdataArr = self.dataForPieChart(sortedPhenotypeData)
      var rankedList = self.rankTheList(sortedPhenotypeData)
      // let data = self.drawSvgBars(sortedPhenotypeData);
      let data = self.drawSvgBars(rankedList);
      self.items = data;

      self.noOfSourcesSvg();
      self.items.map(x=>{
        x.individualRank = self.getRankForEachTerm(x.geneName)
      })
      // if(self.includeClinPhenolyzerGenes && self.clinGenes.length>0){
      //   self.selected = [];
      // // if(self.launchedFromClin && self.clinGenes.length>0){
      //   self.items.map(x=>{
      //     if(self.clinGenes.includes(x.geneName)){
      //       self.selected.push(x);
      //     }
      //   })
      // }
      // else {
      //   self.selected = self.items.slice(0, self.genesTop);
      //
      // }
      // self.selected = self.items.slice(0,50);
      self.phenolyzerStatus = null;
      // self.updatePhenolyzerStatusGlobal(null);
      self.selectedGenesText= ""+ self.selected.length + " of " + self.items.length + " genes selected";
      self.$emit("UpdatePhenolyzerSelectedGenesText", self.selectedGenesText);
      self.$emit("NoOfGenesSelectedFromPhenolyzer", self.selected.length);
      self.$emit("SelectedPhenolyzerGenesToCopy", self.selected);
      this.$emit("PhenolyzerFullGeneList", this.items);
      // console.log("PhenolyzerFullGeneList", this.items);
      //event that all genes are added
    },
    getRankForEachTerm: function(geneName){
      var arr = [];
      if(this.genesSearchTermObj){
        this.multipleSearchTerms.map(x=>{
          var idx = this.genesSearchTermObj[x].findIndex(obj=>obj.name === geneName);
          if(this.genesSearchTermObj.hasOwnProperty(x)){
            var y = this.genesSearchTermObj[x];
            arr.push({
              searchTerm: x,
              score: idx > -1 ? Number(y[idx].score) : 0
            })
          }
        })
      }
      return arr;
    },
    drawSvgBars: function(tempItems){
      var svgWidth = 280;
      var firstBarWidth = tempItems[0].score * 220;
      var score3Decimals;
      tempItems.map(function(gene){
        score3Decimals = Number(gene.score).toFixed(3);
        gene.htmlData = `<svg width="${svgWidth}" height="25" xmlns="http://www.w3.org/2000/svg">
                          <rect class="genepanelsRect"
                                x="1" y="3" rx="5" width="${gene.score * 220}" height="16"/>
                          <rect class="grayRect"
                                x="${(gene.score * 220)+3}" y="3" rx="5" width="${(firstBarWidth - (gene.score * 220))}" height="16"/>
                          <text class="tableRectBarText"
                              x="${(firstBarWidth + 15)}" y="14" font-size="13">${score3Decimals}</text>
                        </svg>`;
        gene.omimSrc = `https://www.ncbi.nlm.nih.gov/omim/?term=${gene.geneName}`;
        gene.medGenSrc = `https://www.ncbi.nlm.nih.gov/medgen/?term=${gene.geneName}`;
        gene.geneCardsSrc = `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene.geneName}`;
        gene.ghrSrc = `https://ghr.nlm.nih.gov/gene/${gene.geneName}`;
        gene.clinGenLink = `https://www.ncbi.nlm.nih.gov/projects/dbvar/clingen/clingen_gene.cgi?sym=${gene.geneName}`;
        gene.geneIdLink = `https://www.ncbi.nlm.nih.gov/gene/${gene.geneId}`;

      })
      return tempItems
    },
    noOfSourcesSvg: function(){
      this.items.map((x, i)=>{
        x.indexVal = i+1;
        x.searchTermIndexSVG = x.searchTermIndex.map(y=>{
          return `<svg height="30" width="30">
                <circle class="sourceIndicator"/>
                <text class="sourceIndicatorText" x="12" y="15" font-weight="600" font-size="10"  dy=".3em">${y}</text>
              </svg> `
        })
      });
    },
  }
}
</script>
