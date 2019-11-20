<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      <v-flex xs12 mt-5>
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Vuetify
        </h1>
        <div id="SingleEntryInput" style="display:inline-block; padding-top:5px;">
          <input
            id="single_entry_input"
            ref="single_entry_input"
            class="form-control"
            type="text"
            v-model="textNotes"
            v-show="textNotes.length<45"
            autocomplete="off"
            placeholder="Enter Phenotypes or Type (paste) Clinical Note">
            <v-textarea
              solo
              v-show="textNotes.length>=45"
              v-model="textNotes"
              ref="single_entry_input_textarea"
              id="single_entry_input_textarea"
              name="input-7-4"
              rows="2"
              style="padding-top:5px"
            ></v-textarea>
        </div>
        <v-btn :disabled="textNotes.length<4" @click="extract" color="primary">Submit</v-btn>

      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'HelloWorld',

  data: () => ({
    search: '',
    multipleSearchTerms: [],
    searchTermsObj: [],
    idx: 0,
    gtrFetchCompleted: false,
    phenolyzerFetchCompleted: false,
    hpoFetchCompleted: false,
    searchTermsObjHeaders: [
      {text: 'Search Term', sortable: false, value: 'DiseaseName'},
      {text: 'GTR Search status', sortable: false, value: 'gtrSearchStatus'},
      {text: 'Phenolyzer Search status', sortable: false, value: 'phenolyzerSearchStatus'},
      {text: 'HPO Search status', sortable: false, value: 'hpoSearchStatus'},
    ],
    summaryGenes: [],
    gtrGenes: [],
    phenolyzerGenes: [],
    searchStatus: false,
    summaryGenesHeader: [
      {text: 'Gene', sortable: false, value: 'name'},
    ],
    alertWarning: false,
    termsReviewDialog: false,
    termsReviewDialogPage: 0,
    generalTermsHint: [],
    gtrVizData: {},
    phenolyzerVizData: {},
    termsExpansionPanel: ['false'],
    expansionpanlExpand: ['true'],
    dropdown_tool: ['All resources', 'GTR', 'Phenolyzer'],
    dropdown_tool_value: 'All resources',
    TotalSummaryGenes: 0,
    TotalSummarySelectedGenes: 0,
    searchComplete: false,
    NewOptionFromGeneralTerm: '',
    GtrReviewTerms: [],
    phenolyzerReviewTerms: [],
    hpoLookupUrl:  "https://nv-prod.iobio.io/hpo/hot/lookup/?term=",
    GtrTermsAdded: [],
    phenolyzerTermsAdded: [],
    loadingDialog: false,
    inputVal: '',
    textNotes: '',
    JaroWinkler: [],
    fuzzyResults: [],
    HPO_Phenotypes_data: null,
    HPO_Terms_data: null,
    HpoTermsTypeaheadData: null,
    HpoReviewTerms: [],
    hpoTermsAdded: [],
    extractedTerms: [],
    extractedTermsObj: [],
    Gtr_searchTermsObj: [],
    Phenolyzer_searchTermsObj: [],
    Hpo_searchTermsObj: [],
    Gtr_idx: 0,
    Phenolyzer_idx: 0,
    Hpo_idx: 0,
    searchStatusDialog: false,
    gtrExpansionPanel: ['true'],
    gtrExpansionPanelMultiple: [],
    phenolyzerExpansionPanel: ['true'],
    phenolyzerExpansionPanelMultiple: [],
    GtrTermsAdded_temp: [],
    phenolyzerTermsAdded_temp: [],
    hpoTermsAdded_temp: [],
    LevenshteinResults: [],
    search_phenolyzerReview: '',
    demoTerms: ['Treacher Collins syndrome ', 'Dejerine-Sottas disease '],
    demoTermsFlag: true,
    WorkflowStepsflag: true,
    phenolyzerRunningStatus: null,
    DuplicateSearchStatusDialog: false,
    snackbarText: "",
    snackbarFlag: false,
    phenolyzer_push_idx: 0,
    gtr_push_idx: 0,
  }),
  methods: {
    extract(){
      this.WorkflowStepsflag = false;
      this.LevenshteinResults = [];
      this.loadingDialog = true;
      this.extractedTerms = [];
      this.extractedTermsObj = [];
      this.demoTermsFlag = false;
      fetch(`http://nv-dev-new.iobio.io/phenotype-extractor/?notes=${this.textNotes}`)
        .then(res => res.json())
        .then(data => {
          this.LevenshteinResults = data.LevenshteinResults;
          data.LevenshteinResults.map(x=>{
            x = x.trim()
            if(!this.extractedTerms.includes(x)){
              this.extractedTerms.push(x);
            }
          })
          console.log(this.extractedTerms);
          
          this.HpoReviewTerms = [];
          this.fetchHpoTerm();

          this.extractedTerms.map(x=>{
            this.extractedTermsObj.push({
              DiseaseName: x,
            })
          })

          this.phenolyzerReviewTerms = this.extractedTermsObj;
          this.phenolyzerReviewTerms.map((item, i) => {
            item.reviewTerms_phenolyzer = [];

            var str = item.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase();
            str = str.replace("disease", "");
            str = str.replace("syndrome", "");
            str = str.trim();

            var data = this.setPhenolyzerTerms(str);
            data.then(res => {
              if(res.length<1){
                var phenotype = item.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase().trim()
                item.reviewTerms_phenolyzer.push({
                  id: phenotype,
                  label: phenotype,
                  value: phenotype,
                })
              }
              res.forEach(x => {
                if(x.value.toLowerCase().trim() !== item.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase().trim()) {
                  item.reviewTerms_phenolyzer.push(x);
                }
                else if(x.value.toLowerCase().trim() === item.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase().trim()) {
                  item.reviewTerms_phenolyzer.unshift(x);
                  item.reviewTerms_phenolyzer[0].general = true;
                }
              })
            })

          })
          console.log("this.phenolyzerReviewTerms", this.phenolyzerReviewTerms)

          this.loadingDialog = false;
          this.openReviewDialogForExtractedTerms();
        })
    }
  }
};
</script>


<style lang="sass">
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

</style>
