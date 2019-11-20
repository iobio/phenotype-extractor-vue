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

      <!-- Loading dialog box -->
        <v-dialog
          v-model="loadingDialog"
          hide-overlay
          persistent
          width="300"
        >
          <v-card
            color="primary"
            dark
          >
            <v-card-text>
                <p style="color:white">Fetching terms for review...</p>
              <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>
        <!-- End Loading dialog box -->


        <!-- Terms review dialog box -->
        <v-card>
          <v-dialog
            v-model="termsReviewDialog"
            scrollable
            persistent :overlay="false"
            max-width="900px"
            transition="dialog-transition"
          >
            <v-card>
              <v-card-title class="headline">
                <span>Review Terms</span>
                <v-spacer></v-spacer>
                <span>
                  <v-btn text icon @click="closeReviewDialog"><v-icon>close</v-icon></v-btn>
                </span>
              </v-card-title>
              <v-card-title v-if="termsReviewDialogPage===1">Select the terms to be searched in GTR:  </v-card-title>
              <div  v-if="termsReviewDialogPage===1">
                <center><i>Please limit to 5 terms in GTR </i></center>
              </div>
              <v-card-title v-if="termsReviewDialogPage===2">Select the terms to be searched in Phenolyzer:</v-card-title>
              <v-card-title v-if="termsReviewDialogPage===3">Select the terms to be searched in HPO:</v-card-title>

              <v-card-text style="height: 430px;">

                <!-- GTR review terms table -->
                <div v-if="GtrReviewTerms.length && termsReviewDialogPage===1">
                  Terms Selected:
                  <span v-for="(term, i) in GtrTermsAdded" v-if="GtrTermsAdded.length">
                    <v-chip outlined color="primary">
                      {{ term.DiseaseName }}
                    </v-chip>
                  </span>
                  <span v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                    <v-chip outlined color="primary">
                      {{ term.DiseaseName }}
                    </v-chip>
                  </span>

                  <div v-if="GtrReviewTerms.length===1">
                    <div >
                      <v-expansion-panels multiple popout focusable>
                        <v-expansion-panel v-model="gtrExpansionPanel" v-for="(item, i) in GtrReviewTerms" :key="i">
                          <v-expansion-panel-header><div><strong>{{ item.DiseaseName }}</strong></div></v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
                              <v-card-text>
                                <div v-for="sub in item.reviewTerms_gtr" class="row">
                                  <div class="col-md-2">
                                    <v-checkbox color="primary" style="margin-top:-2px; margin-bottom:-12px;" v-model="GtrTermsAdded_temp" :value="sub"></v-checkbox>
                                  </div>
                                  <div class="col-md-10">
                                    <span v-if="sub.general">
                                      <span class="highlighted_condition">{{ sub.DiseaseName }}</span>
                                    </span>
                                    <span v-else>{{ sub.DiseaseName }}</span>
                                  </div>
                                </div>
                              </v-card-text>
                            </div>
                          </v-expansion-panel-content>

                        </v-expansion-panel>
                      </v-expansion-panels>

                    </div>
                  </div>
                  <div v-if="GtrReviewTerms.length>1">
                    <div>
                      <v-expansion-panel v-model="gtrExpansionPanelMultiple" expand popout focusable>
                        <v-expansion-panel-content
                          v-for="(item, i) in GtrReviewTerms" :key="i">
                          <template v-slot:header>
                            <div><strong>{{ item.DiseaseName }}</strong></div>
                          </template>
                          <v-card class="reviewCard">
                            <v-card-text >
                              <div v-for="sub in item.reviewTerms_gtr" >
                                <div class="row">
                                  <div class="col-md-2">
                                    <v-checkbox color="primary" style="margin-top:-2px; margin-bottom:-12px;" v-model="GtrTermsAdded_temp" :value="sub"></v-checkbox>
                                  </div>
                                  <div class="col-md-10">
                                    <span v-if="sub.general">
                                      <span class="highlighted_condition">{{ sub.DiseaseName }}</span>
                                    </span>
                                    <span v-else>{{ sub.DiseaseName }}</span>
                                  </div>
                                </div>
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-expansion-panel-content>

                      </v-expansion-panel>
                    </div>
                  </div>

                </div>
                <div v-if="!GtrReviewTerms.length && termsReviewDialogPage===1">
                  Currently unavailable.
                </div>



                <!-- Phenolyzer review terms table -->
                <div v-if="phenolyzerReviewTerms.length && termsReviewDialogPage===2">
                  Terms Selected:
                  <span v-for="(term, i) in phenolyzerTermsAdded" v-if="phenolyzerTermsAdded.length">
                    <v-chip outlined color="primary">
                      {{ term.value }}
                    </v-chip>
                  </span>
                  <span v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                    <v-chip outlined color="primary">
                      {{ term.value }}
                    </v-chip>
                  </span>

                  <div v-if="phenolyzerReviewTerms.length===1">
                    <div >
                      <v-expansion-panel v-model="phenolyzerExpansionPanel" expand popout focusable>
                        <v-expansion-panel-content v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <template v-slot:header>
                            <div><strong>{{ item.DiseaseName }}</strong></div>
                          </template>

                          <v-card class="reviewCard">
                            <v-card-text>
                              <div v-for="sub in item.reviewTerms_phenolyzer" class="row">
                                <div class="col-md-2">
                                  <v-checkbox color="primary" style="margin-top:-2px; margin-bottom:-12px;" v-model="phenolyzerTermsAdded_temp" :value="sub"></v-checkbox>
                                </div>
                                <div class="col-md-10">
                                  <span v-if="sub.general">
                                    <span class="highlighted_condition">{{ sub.value | to-firstCharacterUppercase }}</span>
                                  </span>
                                  <span v-else>{{ sub.value | to-firstCharacterUppercase }}</span>
                                </div>
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-expansion-panel-content>

                      </v-expansion-panel>
                    </div>
                  </div>
                  <div v-if="phenolyzerReviewTerms.length>1">
                    <div>
                      <v-expansion-panel v-model="phenolyzerExpansionPanelMultiple" expand popout focusable>
                        <v-expansion-panel-content
                          v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <template v-slot:header>
                            <div><strong>{{ item.DiseaseName }}</strong></div>
                          </template>
                          <v-card class="reviewCard">
                            <v-card-text >
                              <!-- <div v-for="sub in searchFilter(item.reviewTerms_phenolyzer)" > -->
                              <div v-for="sub in item.reviewTerms_phenolyzer" >
                                <div class="row">
                                  <div class="col-md-2">
                                    <v-checkbox color="primary" style="margin-top:-2px; margin-bottom:-12px;" v-model="phenolyzerTermsAdded_temp" :value="sub"></v-checkbox>
                                  </div>
                                  <div class="col-md-10">
                                    <span v-if="sub.general">
                                      <span class="highlighted_condition">{{ sub.value | to-firstCharacterUppercase }}</span>
                                    </span>
                                    <span v-else>{{ sub.value | to-firstCharacterUppercase }}</span>

                                  </div>
                                </div>
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-expansion-panel-content>

                      </v-expansion-panel>
                    </div>
                  </div>
                </div>
                <div v-if="!phenolyzerReviewTerms.length && termsReviewDialogPage===2">
                  Currently unavailable.
                </div>


                <!-- HPO review terms table -->
                <div v-if="HpoReviewTerms.length && termsReviewDialogPage===3">
                  Terms Selected:
                  <span v-for="(term, i) in hpoTermsAdded" v-if="hpoTermsAdded.length">
                    <v-chip outlined color="primary">
                      {{ term.HPO_Data }}
                    </v-chip>
                  </span>
                  <span v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                    <v-chip outlined color="primary">
                      {{ term.HPO_Data }}
                    </v-chip>
                  </span>


                  <v-card class="elevation-4">
                    <v-card-text>
                      <table class="table table-hover">
                        <thead>
                          <tr>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(term, i) in HpoReviewTerms" :key="i">
                            <th scope="row">
                              <v-checkbox color="primary" style="margin-top:8px; margin-bottom:-12px;" v-model="hpoTermsAdded_temp" :value="term"></v-checkbox>
                            </th>
                            <td>{{ term.HPO_Data }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </v-card-text>
                  </v-card>
                </div>
                <div v-if="!HpoReviewTerms.length && termsReviewDialogPage===3">
                  Currently unavailable.
                </div>


                <!-- All terms review page -->
                <div v-if="termsReviewDialogPage===4">
                  <v-card>
                    <v-card-text v-if="GtrTermsAdded_temp.length">
                      <h4>GTR: </h4>
                      <p v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                        <v-chip outlined color="primary">
                          {{ term.DiseaseName }}
                        </v-chip>
                      </p>
                      <a @click="termsReviewDialogPage=1"><small><i>Update</i></small></a>
                    </v-card-text>
                    <v-card v-else>
                      <v-card-text>
                        <p>GTR Terms not selected</p>
                      </v-card-text>
                    </v-card>
                  </v-card>
                  <br>

                  <v-card>
                    <v-card-text v-if="phenolyzerTermsAdded_temp.length">
                      <h4>Phenolyzer: </h4>
                      <p v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                        <v-chip outlined color="primary">
                          {{ term.value }}
                        </v-chip>
                      </p>
                      <a @click="termsReviewDialogPage=2"><small><i>Update</i></small></a>
                    </v-card-text>
                    <v-card v-else>
                      <v-card-text>
                        <p>Phenolyzer Terms not selected</p>
                      </v-card-text>
                    </v-card>
                  </v-card>
                  <br>

                  <v-card>
                    <v-card-text v-if="hpoTermsAdded_temp.length">
                      <h4>HPO: </h4>
                      <p v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                        <v-chip outlined color="primary">
                          {{ term.HPO_Data }}
                        </v-chip>
                        <a @click="termsReviewDialogPage=3"><small><i>Update</i></small></a>
                      </p>
                    </v-card-text>
                    <v-card v-else>
                      <v-card-text>
                        <p>HPO Terms not selected</p>
                      </v-card-text>
                    </v-card>
                  </v-card>
                  <br>

                </div>


              </v-card-text>
              <v-card-actions>
                <div class="flex-grow-1"></div>
                <!-- <v-btn small color="blue darken-1" round outlined dark text @click="termsReviewDialog=false">Skip</v-btn> -->
                <v-btn :disabled="termsReviewDialogPage===1" small color="blue darken-1" text @click="--termsReviewDialogPage">Back</v-btn>
                <v-btn :disabled="termsReviewDialogPage>3" small color="blue darken-1" text @click="++termsReviewDialogPage">Next</v-btn>
                <v-spacer></v-spacer>
                <v-btn :disabled="termsReviewDialogPage!==4" small color="blue darken-1" text @click="selectReviewTerms">Done</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
        <!-- End terms review dialog -->



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
    },
    fetchHpoTerm(){
      const cmd = api.clinphen({ notes: `${this.textNotes}`});
      cmd.then((data) => {
        this.parseTerms(data);
      });
    },
    parseTerms(res){
      var count = 0;
      var hpoTermArr = [];
      var terms = [];
      res.split("\n").forEach(function(rec){
        var fields = rec.split("\t");
        if(fields.length===5){
          var hpoNumber = fields[0];
          var phenotype = fields[1];
          var occurrences = fields[2];
          var earliness = fields[3];
          var sentence = fields[4];
          terms.push(hpoNumber)
          hpoTermArr.push(
            {
              hpoNumber:hpoNumber,
              phenotype:phenotype,
              occurrences:occurrences,
              earliness:earliness,
              sentence:sentence,
              HPO_Data: `${phenotype} - [ ${hpoNumber} ] `
            }
          )
        }
      })
      hpoTermArr.shift();
      terms.shift();
      hpoTermArr.forEach(x => {
        var found = this.HpoReviewTerms.some(el => el.HPO_Data === x.HPO_Data);
        if(!found){ this.HpoReviewTerms.push(x)}
      })
      // this.HpoReviewTerms = hpoTermArr;
    },
    setPhenolyzerTerms(str){
      return fetch(`https://nv-prod.iobio.io/hpo/hot/lookup/?term=${str}`)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            return data
          })
    },
    openReviewDialog(){
      this.textNotes = this.search.DiseaseName;
      this.GtrReviewTerms = [];
      this.termsExpansionPanel = ['true'];
      this.demoTermsFlag = false;
      this.GtrReviewTerms.push(this.search);
      this.GtrReviewTerms[0].reviewTerms_gtr = []

      var term = this.search.DiseaseName.toLowerCase();
      term = term.replace("disease", "");
      term = term.replace("syndrome", "");
      term = term.trim();
      DiseaseNamesData.data.forEach(x => {
        if(x.DiseaseName.toLowerCase().includes(term)){
          if(x.DiseaseName !== this.search.DiseaseName){
            this.GtrReviewTerms[0].reviewTerms_gtr.push(x)
          }
          else if(x.DiseaseName === this.search.DiseaseName){
            this.GtrReviewTerms[0].reviewTerms_gtr.unshift(x);
            this.GtrReviewTerms[0].reviewTerms_gtr[0].general = true;
          }
        }
      })

      this.phenolyzerReviewTerms = [];
      this.phenolyzerReviewTerms.push(this.search);
      this.phenolyzerReviewTerms[0].reviewTerms_phenolyzer = []

      var str = this.search.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase();
      str = str.replace("disease", "");
      str = str.replace("syndrome", "");
      // str = str.replace("disorder", "");
      str = str.trim();

      var data = this.setPhenolyzerTerms(str);
      data.then(res => {
        //TODO: If res.length is 0, see the example from extracted terms
        res.forEach(x => {
          if(x.value.toLowerCase().trim() !== this.search.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase().trim()) {
            this.phenolyzerReviewTerms[0].reviewTerms_phenolyzer.push(x);
          }
          else if(x.value.toLowerCase().trim() === this.search.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase().trim()) {
            this.phenolyzerReviewTerms[0].reviewTerms_phenolyzer.unshift(x);
            this.phenolyzerReviewTerms[0].reviewTerms_phenolyzer[0].general = true;
          }
        })

      })

      this.HpoReviewTerms = [];
      this.HpoTermsTypeaheadData.forEach(x => {
        if(x.HPO_Data.toLowerCase().includes(str)){
          this.HpoReviewTerms.push(x);
        }
      })
      this.fetchHpoTerm();



    setTimeout(()=>{
        this.termsReviewDialog = true;
        this.termsReviewDialogPage = 1;
        this.loadingDialog = false;
    },500)

    },
    closeReviewDialog(){
      this.termsReviewDialog=false;
      this.termsReviewDialogPage = 0;
      this.GtrTermsAdded_temp = [];
      this.phenolyzerTermsAdded_temp = [];
      this.hpoTermsAdded_temp = [];
    },
    openReviewDialogForExtractedTerms(){
      this.GtrReviewTerms = this.extractedTermsObj;
      this.GtrReviewTerms.map(item => {
        item.reviewTerms_gtr = [];

        var term = item.DiseaseName.toLowerCase();
        term = term.replace("disease", "");
        term = term.replace("syndrome", "");
        term = term.trim();
        DiseaseNamesData.data.forEach(x => {
          if(x.DiseaseName.toLowerCase().includes(term)){
            // this.GtrReviewTerms.push(x);
            if(x.DiseaseName !== item.DiseaseName){
              item.reviewTerms_gtr.push(x)
            }
            else if(x.DiseaseName === item.DiseaseName){
              item.reviewTerms_gtr.unshift(x);
              item.reviewTerms_gtr[0].general = true;

            }
          }
        })
      })
      // this.gtrExpansionPanelMultiple = Array(this.GtrReviewTerms.length).fill('true');
      console.log("this.GtrReviewTerms", this.GtrReviewTerms)
      setTimeout(()=>{
          this.termsReviewDialog = true;
          this.termsReviewDialogPage = 1;
          this.loadingDialog = false;
      },500)

    },
    selectReviewTerms(){
      console.log("review terms selected!!")
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

  .reviewCard
    height: 250px
    overflow-y: auto
</style>
