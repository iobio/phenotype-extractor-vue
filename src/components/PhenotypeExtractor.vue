<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      <v-flex xs12 mt-5 mb-6>
        <h1 class="display-2 font-weight-bold mb-3">
        </h1>
        <div class="ml-2 mr-4" id="SingleEntryInput" style="display:inline-block; padding-top:5px;">
          <input
            id="single_entry_input"
            ref="single_entry_input"
            class="pl-4 pr=4"
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
            <typeahead
              v-model="search"
              hide-details="false"
              target="#single_entry_input"
              force-select :force-clear="true"
              :data="DiseaseNames"
              :limit="parseInt(100)"
              v-on:keydown="EnterForSearch"
              v-on:input="mouseSelect"
              item-key="DiseaseName"/>
        </div>
        <v-btn :disabled="textNotes.length<4" @click="extract" color="primary">Submit</v-btn>
      </v-flex>


      <v-flex xs12 mt-5>
        <!-- Start searched terms view -->
          <v-card-text>
            <div class="row">
              <div class="col-md-9">
                <div class="row">
                  <div class="col-md-12 mb-2">
                    <strong style="float:left">GTR Terms: </strong>
                    <br>
                    <div class="mb-2" v-if="GtrTermsAdded.length">
                      <v-chip-group
                        multiple
                      >
                        <v-chip color="primary" v-for="(term, i) in GtrTermsAdded" text-color="white" close :key="i" @click:close="remove(term, i, 'GTR')">
                          <span style="color:white" v-if="term.DiseaseName!==undefined">{{ i+1 }} . {{ term.DiseaseName }}</span>
                          <span style="color:white" v-else> {{ i+1 }} . {{ term }}</span>
                        </v-chip>
                      </v-chip-group>
                    </div>
                    <span v-if="GtrTermsAdded.length===0">
                      <v-chip style="float:left"><v-icon left>error_outline</v-icon> No conditions</v-chip>
                    </span>
                  </div>
                  <div class="col-md-12 mb-2">
                    <strong style="float:left">Phenolyzer Terms: </strong>
                    <br>
                    <div class="mb-2"  v-if="phenolyzerTermsAdded.length">
                      <v-chip-group
                        multiple
                      >
                        <v-chip color="primary" v-for="(term, i) in phenolyzerTermsAdded" text-color="white" close :key="i" @click:close="remove(term, i, 'phenolyzer')">
                          <span style="color:white"> {{ i+1 }} . {{ term.value }}</span>
                        </v-chip>
                      </v-chip-group>
                    </div>
                    <div class="mb-2" v-if="phenolyzerTermsAdded.length===0">
                      <v-chip style="float:left"><v-icon left>error_outline</v-icon> No phenotypes</v-chip>
                    </div>
                  </div>
                  <div class="col-md-12 mb-2">
                    <strong style="float:left">HPO Terms: </strong>
                    <br>
                    <div class="mb-2" v-if="hpoTermsAdded.length">
                      <v-chip-group
                        multiple
                      >
                        <v-chip color="primary" v-for="(term, i) in hpoTermsAdded" text-color="white" close :key="i" @click:close="remove(term, i, 'HPO')">
                          <span style="color:white"> {{ i+1 }} . {{ term.HPO_Data }}</span>
                        </v-chip>
                      </v-chip-group>
                    </div>
                    <div class="mb-2" v-if="hpoTermsAdded.length===0">
                      <v-chip style="float:left"><v-icon left>error_outline</v-icon> No HPO terms</v-chip>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <SummaryTab
                  v-bind:GtrGenesForSummary="GtrGenesForSummary"
                  v-bind:PhenolyzerGenesForSummary="PhenolyzerGenesForSummary"
                  v-bind:manuallyAddedGenes="manuallyAddedGenes"
                  v-bind:clinPhenSelectedGenes="clinPhenSelectedGenes"
                  v-bind:gtrCompleteGeneList="GtrGenesForSummary"
                  v-bind:phenolyzerCompleteGeneList="PhenolyzerGenesForSummary"
                  :GtrTermsLength="GtrTermsAdded.length"
                  :PhenolyzerTermsLength="phenolyzerTermsAdded.length"
                  :HpoTermsLength="hpoTermsAdded.length"
                  :multipleSearchTerms="multipleSearchTerms"
                  :summaryFullGeneList="summaryFullGeneList"
                  @summaryGenesFullList="summaryGenesFullList($event)"
                  :VennDiagramData="VennDiagramData">
                </SummaryTab>
              </div>

            </div>
          </v-card-text>
        <!-- End searched terms view  -->


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
                <!-- <span>Review Terms</span> -->
                <v-spacer></v-spacer>
                <span>
                  <v-btn text icon @click="closeReviewDialog"><v-icon>close</v-icon></v-btn>
                </span>
              </v-card-title>
              <v-card-title v-if="termsReviewDialogPage===1">Select the terms to be searched in GTR:  </v-card-title>
              <div  v-if="termsReviewDialogPage===1">
                <!-- <center><i>Please limit to 5 terms in GTR </i></center> -->
              </div>
              <v-card-title v-if="termsReviewDialogPage===2">Select the terms to be searched in Phenolyzer:</v-card-title>
              <v-card-title v-if="termsReviewDialogPage===3">Select the terms to be searched in HPO:</v-card-title>
              <v-card-title v-if="termsReviewDialogPage===4">Review selected terms:</v-card-title>

              <v-card-text style="height: 430px;">

                <!-- GTR review terms table -->
                <div v-if="GtrReviewTerms.length && termsReviewDialogPage===1">
                  Terms Selected:
                  <span v-for="(term, i) in GtrTermsAdded" v-if="GtrTermsAdded.length">
                    <v-chip class="mr-2" small outlined color="primary">
                      {{ term.DiseaseName }}
                    </v-chip>
                  </span>
                  <span v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                    <v-chip class="mr-2" small outlined color="primary">
                      {{ term.DiseaseName }}
                    </v-chip>
                  </span>
                  <br><br>
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
                      <v-expansion-panels multiple popout focusable>
                        <v-expansion-panel v-model="gtrExpansionPanelMultiple" v-for="(item, i) in GtrReviewTerms" :key="i">
                          <v-expansion-panel-header><div><strong>{{ item.DiseaseName }}</strong></div></v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
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
                            </div>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>

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
                    <v-chip class="mr-2" small outlined color="primary">
                      {{ term.value }}
                    </v-chip>
                  </span>
                  <span v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                    <v-chip class="mr-2" small outlined color="primary">
                      {{ term.value }}
                    </v-chip>
                  </span>
                  <br><br>
                  <div v-if="phenolyzerReviewTerms.length===1">
                    <div >
                      <v-expansion-panels popout focusable>
                        <v-expansion-panel v-model="phenolyzerExpansionPanel" v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <v-expansion-panel-header><div><strong>{{ item.DiseaseName }}</strong></div></v-expansion-panel-header>
                            <div class="reviewCard">
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
                            </div>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>

                    </div>
                  </div>
                  <div v-if="phenolyzerReviewTerms.length>1">
                    <div>
                      <v-expansion-panels multiple popout focusable>
                        <v-expansion-panel v-model="phenolyzerExpansionPanelMultiple" v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <v-expansion-panel-header><div><strong>{{ item.DiseaseName }}</strong></div></v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
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
                            </div>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>

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
                    <v-chip class="mr-2" small outlined color="primary">
                      {{ term.HPO_Data }}
                    </v-chip>
                  </span>
                  <span v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                    <v-chip class="mr-2" small outlined color="primary">
                      {{ term.HPO_Data }}
                    </v-chip>
                  </span>
                  <br><br>

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
                <v-btn :disabled="termsReviewDialogPage===1" small color="primary" text @click="--termsReviewDialogPage">Back</v-btn>
                <v-btn :disabled="termsReviewDialogPage>3" small color="primary" text @click="++termsReviewDialogPage">Next</v-btn>
                <v-spacer></v-spacer>
                <v-btn :disabled="termsReviewDialogPage!==4" small color="primary" text @click="selectReviewTerms">Done</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
        <!-- End terms review dialog -->


        <!-- Search statis dialog -->
        <!-- TODO: persistent property removed, add it back -->
        <v-card>
          <v-dialog
            v-model="searchStatusDialog"
            scrollable
            :overlay="false"
            max-width="1000px"
            transition="dialog-transition"
          >
            <v-card>
              <v-card-title class="headline">Search Status</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <div class="container">
                  <div class="row">
                    <div class="col-md-4">
                      <table class="table">
                        <thead>
                          <tr> <strong>GTR Search status</strong></tr>
                        </thead>
                        <tbody>
                          <tr v-if="Gtr_searchTermsObj.length" v-for="(term, i) in Gtr_searchTermsObj" :key="i">
                            <td>{{ term.DiseaseName }}</td>
                            <td >
                              <span v-if="term.gtrSearchStatus==='Searching'">
                                <v-progress-circular
                                  :width="2"
                                  :size="20"
                                  indeterminate
                                  color="primary"
                                ></v-progress-circular>
                              </span>
                              <span v-else-if="term.gtrSearchStatus==='Completed'">
                                <v-icon color="green">done</v-icon>
                              </span>
                              <span v-else-if="term.gtrSearchStatus==='NoGenes'"><v-icon color="red">error</v-icon></span>
                              <span v-else-if="term.gtrSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                              <span v-else> <v-icon color="gray lighten-4">error</v-icon>  </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-if="Gtr_searchTermsObj.length<1">
                        <span><i>Not Selected...</i></span>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <table class="table">
                        <thead>
                          <tr>
                            <strong>Phenolyzer Search status</strong>
                            <!-- <div v-if="Phenolyzer_searchTermsObj.length>1"> -->
                            <div v-if="Phenolyzer_searchTermsObj.length>0">
                              <!-- <div v-if="phenolyzerRunningStatus!==null" class="row">
                                <div class="col-md-3">
                                  <i>{{ phenolyzerRunningStatus | to-firstCharacterUppercase }} </i>
                                </div>
                                <div class="col-md-7">
                                  <span><v-progress-linear :indeterminate="true" height="5"></v-progress-linear></span>
                                </div>
                                <div class="col-md-2">
                                  <v-btn flat icon @click="stopPhenolyzerSearch"><v-icon>close</v-icon></v-btn>
                                </div>
                              </div> -->
                            </div>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(term, i) in Phenolyzer_searchTermsObj" :key="i">
                            <!-- <td v-if="i>0">{{ term.value }}</td>
                            <td v-if="i>0" > -->
                            <td>{{ term.value }}</td>
                            <td>
                              <span v-if="term.phenolyzerSearchStatus==='Searching'">
                                <v-progress-circular
                                  :width="2"
                                  :size="20"
                                  indeterminate
                                  color="primary"
                                ></v-progress-circular>
                              </span>
                              <span v-else-if="term.phenolyzerSearchStatus==='running'">
                                <v-progress-circular
                                  :width="2"
                                  :size="20"
                                  indeterminate
                                  color="primary"
                                ></v-progress-circular>
                                Running
                                <br>
                                <span @click="stopPhenolyzerSearch(term.value)">close</span>
                              </span>
                              <span v-else-if="term.phenolyzerSearchStatus==='Completed'"><v-icon color="green">done</v-icon></span>
                              <span v-else-if="term.phenolyzerSearchStatus==='NoGenes'"><v-icon color="red">error</v-icon></span>
                              <span v-else-if="term.phenolyzerSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                              <span v-else-if="term.phenolyzerSearchStatus==='Cancelled'"><v-icon color="gray lighten-4">cancel_schedule_send</v-icon></span>
                              <span v-else> <v-icon color="gray lighten-4">error</v-icon>  </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- <div v-if="Phenolyzer_searchTermsObj.length<2"> -->
                      <div v-if="Phenolyzer_searchTermsObj.length<1">
                        <span><i>Not Selected...</i></span>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <table class="table">
                        <thead>
                          <tr> <strong>HPO Search status</strong></tr>
                        </thead>
                        <tbody>
                          <tr v-for="(term, i) in Hpo_searchTermsObj" :key="i">
                            <td>{{ term.HPO_Data }}</td>
                            <td >
                              <span v-if="term.hpoSearchStatus==='Searching'">
                                <v-progress-circular
                                  :width="2"
                                  :size="20"
                                  indeterminate
                                  color="primary"
                                ></v-progress-circular>
                              </span>
                              <span v-else-if="term.hpoSearchStatus==='Completed'"><v-icon color="green">done</v-icon></span>
                              <span v-else-if="term.hpoSearchStatus==='NoGenes'"><v-icon color="red">error</v-icon></span>
                              <span v-else-if="term.hpoSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                              <span v-else> <v-icon color="gray lighten-4">error</v-icon>  </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-if="Hpo_searchTermsObj.length<1">
                        <span><i>Not Selected...</i></span>
                      </div>
                    </div>

                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-card>
        <!-- End search status dialog -->

        <GtrSearch
          v-on:filteredDiseasesItems="filteredDiseasesItems"
          v-on:filteredDiseasesItems_removeItem="filteredDiseasesItems_removeItem"
          v-on:searchTermDiseases="searchTermDiseases($event)"
          v-on:currentSearchTerm="currentSearchTerm($event)">
        </GtrSearch>

        <PhenolyzerSearch
          @phenolyzerIndividualGenes="phenolyzerIndividualGenes($event)"
          @PhenolyzerFullGeneList="PhenolyzerFullGeneList($event)"
          @individualGenesObjPhenolyzer="individualGenesObjPhenolyzer($event)">
        </PhenolyzerSearch>

        <HpoSearch
          @hpoIndividualGenes="hpoIndividualGenes($event)"
          @HpoFullGeneList="HpoFullGeneList($event)"
          @individualGenesObjHpo="individualGenesObjHpo($event)">
        </HpoSearch>


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
import SummaryTab from './SummaryTab.vue';
import { Typeahead } from 'uiv';
import PhenolyzerSearch from './PhenolyzerSearch.vue';
import HpoSearch from './HpoSearch.vue';

import Model from '../models/Model';
var model = new Model();


export default {
  name: 'PhenotypeExtractor',
  components: {
    GtrSearch,
    SummaryTab,
    PhenolyzerSearch,
    HpoSearch
  },
  props: {
    phenotypes: {
      type: Array
    },
    summaryFullGeneList: {
      type: Array
    },
    VennDiagramData: {
      type: Object
    }
  },
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
    Gtr_idx: 0, //increment when event emitted for search
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
    gtr_push_idx: 0, //increment when new term is added to gtr_Searchobj after reveiew
    filteredDiseasesItemsArray: [],
    diseasesProps: [],
    associatedGenes: [],
    selectedPanelFilters: ["specific", "moderate"],
    lowerLimit: 20,
    upperLimit: 45,
    geneProps: [],
    arrangedSearchData: [],
    launchedFromClinProps: false,
    GenesToDisplay: [],
    DataToIncludeSearchTerms: [],
    items: [],
    individualDiseases: [],
    diseasesPropsIndividual: [],
    associatedGenesIndividual: [],
    genePropsIndividual: [],
    panelsSearchTermObj: {},
    currentSearchedTerm: "",
    Gtr_searchTermArray: [], //An array of Gtr searched terms, not an object
    Gtr_search_complete_idx: 0,
    Phenolyzer_searchTermArray: [],
    Phenolyzer_search_complete_idx: 0,
    manuallyAddedGenes: [],
    clinGenesSummary: [],
    GtrGenesForSummary: [],
    PhenolyzerGenesForSummary: [],
    clinPhenSelectedGenes: [],
    phenolyzerIndividualItems: [],
    phenolyzerItems: [],
    Hpo_searchTermArray: [],
    Hpo_search_complete_idx: 0,
    summaryAllGenes: [],
    individualGenesSearchTermPhenolyzer: [],
    individualGtrPanelsSearchObj: {},
    selectedObj: {},
    individualGenesSearchTermGtr:{},
    individualGenesSearchTermHpo:{},
    gtrSavedState: false,
    gtrSavedTermsLength: 0,
    gtr_saved_idx: 0,
    phenolyzerSavedState: false,
    phenolyzerSavedTermsLength: 0,
    phenolyzer_saved_idx: 0,
    hpoSavedState: false,
    hpoSavedTermsLength: 0,
    hpo_saved_idx: 0,
    has_saved_state: null,
    hpoItems: [],
  }),
  watch: {
    textNotes(){
      if(this.textNotes.length===45){
        setTimeout(()=>{
          this.$refs.single_entry_input_textarea.focus();
        },10)
      }
      else if(this.textNotes.length===44){
        setTimeout(()=>{
          this.$refs.single_entry_input.focus();
        },10)
      }
    },

  },
  mounted(){
    this.HPO_Terms_data = HPO_Terms;
    this.HPO_Phenotypes_data = HPO_Phenotypes;
    this.HpoTermsTypeaheadData  = HpoTermsData.data;

    bus.$on("completePhenolyzerFetchRequest", searchTerm => {
      var idx = this.Phenolyzer_searchTermArray.indexOf(searchTerm);
      this.$set(this.Phenolyzer_searchTermsObj[idx], 'phenolyzerSearchStatus', "Completed");
      this.Phenolyzer_search_complete_idx = this.Phenolyzer_search_complete_idx+1;
      if(this.Phenolyzer_search_complete_idx === this.Phenolyzer_searchTermArray.length){
        this.phenolyzerFetchCompleted = true;
        if(!this.phenolyzerSavedState){
          this.checkToCloseSearchStatusDialog();
        }
      }
    })

    bus.$on("RunningPhenolyzerFetchRequest", searchTerm => {
      var idx = this.Phenolyzer_searchTermArray.indexOf(searchTerm);
      this.$set(this.Phenolyzer_searchTermsObj[idx], 'phenolyzerSearchStatus', "running");
    })


    bus.$on("StoppedPhenolyzerFetchRequest", searchTerm => {
      var idx = this.Phenolyzer_searchTermArray.indexOf(searchTerm);
      this.$set(this.Phenolyzer_searchTermsObj[idx], 'phenolyzerSearchStatus', "Cancelled");
      this.Phenolyzer_search_complete_idx = this.Phenolyzer_search_complete_idx+1;
      if(this.Phenolyzer_search_complete_idx === this.Phenolyzer_searchTermArray.length){
        this.phenolyzerFetchCompleted = true;
        if(!this.phenolyzerSavedState){
          this.checkToCloseSearchStatusDialog();
        }
      }
    })


    bus.$on("NoGenesPhenolyzerRequest", searchTerm => {
      var idx = this.Phenolyzer_searchTermArray.indexOf(searchTerm);
      this.$set(this.Phenolyzer_searchTermsObj[idx], 'phenolyzerSearchStatus', "NoGenes");
      this.Phenolyzer_search_complete_idx = this.Phenolyzer_search_complete_idx+1;
      if(this.Phenolyzer_search_complete_idx === this.Phenolyzer_searchTermArray.length){
        this.phenolyzerFetchCompleted = true;
        if(!this.phenolyzerSavedState){
          this.checkToCloseSearchStatusDialog();
        }
      }
    })

    bus.$on("completeHpoFetchRequest", searchTerm => {
      var idx = this.Hpo_searchTermArray.indexOf(searchTerm);
      this.$set(this.Hpo_searchTermsObj[idx], 'hpoSearchStatus', "Completed");
      this.Hpo_search_complete_idx = this.Hpo_search_complete_idx+1;
      if(this.Hpo_search_complete_idx === this.Hpo_searchTermArray.length){
        this.hpoFetchCompleted = true;
        this.checkToCloseSearchStatusDialog();
      }
    })

    //Check if there is saved state
    if(this.phenotypes.length){
      this.has_saved_state = true;
    }

    if(this.phenotypes.length && this.phenotypes[0].length){
      this.gtrSavedState= true;
      this.gtrSavedTermsLength = this.phenotypes[0].length;
      this.GtrTermsAdded = this.phenotypes[0];
      this.GtrTermsAdded.map(term => {
        this.gtr_push_idx = this.gtr_push_idx + 1;
        this.Gtr_searchTermsObj.push(term);
        this.Gtr_searchTermArray.push(term.DiseaseName);
      })
      this.Gtr_performSearchEvent_saved()
    }

    if(this.phenotypes.length && this.phenotypes[1].length){
      this.phenolyzerSavedState= true;
      this.phenolyzerSavedTermsLength = this.phenotypes[1].length;
      this.phenolyzerTermsAdded = this.phenotypes[1];
      this.phenolyzerTermsAdded.map(term => {
        this.phenolyzer_push_idx = this.phenolyzer_push_idx + 1;
        this.Phenolyzer_searchTermsObj.push(term);
        this.Phenolyzer_searchTermArray.push(term.value);
      })
      this.Phenolyzer_performSearchEvent_saved()
    }

    if(this.phenotypes.length && this.phenotypes[2].length){
      this.hpoSavedState= true;
      this.hpoSavedTermsLength = this.phenotypes[1].length;
      this.hpoTermsAdded = this.phenotypes[1];
      this.hpoTermsAdded.map(term => {
        this.Hpo_searchTermsObj.push(term);
        this.Hpo_searchTermArray.push(term.hpoNumber);
      })
      this.Hpo_performSearchEvent_saved()
    }

  },
  computed: {
    DiseaseNames: function() {
      return DiseaseNames.data.sort(function(a,b) {
        if (a.DiseaseName < b.DiseaseName) {
          return -1;
        } else if (a.DiseaseName > b.DiseaseName) {
          return 1;
        } else {
          return 0;
        }
      });
    },
  },
  methods: {
    summaryGenesFullList(genes){
      // this.$emit('summaryGenes', genes);
      this.summaryAllGenes = genes;
      this.getIndividualGeneList();
      var clinData = this.summaryAllGenes.map(gene=> {
          return {
            name: gene.name,
            source: gene.sources,
            geneId: gene.geneId,
            score: gene.score,
            genePanels: gene.value,
            searchTermHpo: this.setSearchTermsHpo(gene.hpoTerm, gene.name),
            searchTermsPhenolyzer: this.setSearchTermsPhenolyzer(gene.searchTermPheno, gene.name),
            searchTermsGtr: this.setSearchTermsGTR(gene.searchTermArrayGTR, gene.name),
            geneRankGtr: gene.geneRankGtr,
            geneRankPhenolyzer: gene.geneRankPhenolyzer
          }
        })
        // console.log("clinData", clinData)
        this.$emit('summaryGenes', clinData);

    },

    getIndividualGeneList(){
      for(const prop in this.selectedObj){
        var mergedGenes = model.mergeGenesAcrossPanels(this.selectedObj[prop]);
        let data = model.getIndividualGenes(mergedGenes );
        this.createSeperateGenesObj(data, prop);
      }
    },
    createSeperateGenesObj(genes, term){
      this.individualGenesSearchTermGtr[term] = genes;
      this.individualGenesSearchTermGtr[term].map((x,i)=>{
        x.genePanelsCount = x.value;
        x.rank = i+1;
      })
    },

    setSearchTermsGTR(searchTermArrayGTR, geneName){
        var arr =[];
        if(this.individualGenesSearchTermGtr){
          searchTermArrayGTR.map(x=>{
            var idx = this.individualGenesSearchTermGtr[x].findIndex(obj=>obj.name === geneName);
            var y = this.individualGenesSearchTermGtr[x];
            if(this.individualGenesSearchTermGtr.hasOwnProperty(x)){
              if(y[idx]!==undefined){
                arr.push({
                  searchTerm: x,
                  rank: y[idx].rank,
                  genePanelsCount: y[idx].genePanelsCount
                })
              }
              else {
                arr.push({
                  searchTerm: x
                })
              }
            }
          })
        }
        return arr;
      },

    setSearchTermsPhenolyzer: function(searchTermPheno, geneName){
      var arr =[];
      if(this.individualGenesSearchTermPhenolyzer){
        searchTermPheno.map(x=>{
          var idx = this.individualGenesSearchTermPhenolyzer[x].findIndex(obj=>obj.name === geneName);
          if(this.individualGenesSearchTermPhenolyzer.hasOwnProperty(x)){
            var y = this.individualGenesSearchTermPhenolyzer[x];
            arr.push({
              searchTerm: x,
              rank: Number(y[idx].rank),
              score: Number(y[idx].score)
            })
          }
        })
      }
      return arr;
    },


    setSearchTermsHpo: function(searchTermhpo, geneName){
      var arr =[];
      if(this.individualGenesSearchTermHpo){
        searchTermhpo.map(x=>{
          var idx = this.individualGenesSearchTermHpo[x].findIndex(obj=>obj.name === geneName);
          if(this.individualGenesSearchTermHpo.hasOwnProperty(x)){
            // var y = this.individualGenesSearchTermHpo[x];
            arr.push({
              searchTerm: x,
            })
          }
        })
      }
      return arr;
    },

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
          // console.log(this.extractedTerms);

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
          // console.log("this.phenolyzerReviewTerms", this.phenolyzerReviewTerms)

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
            // console.log(data);
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
    mouseSelect(){
      if(this.search!==undefined){
        this.WorkflowStepsflag = false;
        this.loadingDialog = true;
        // this.checkBeforeAddTerm();
        setTimeout(()=>{
          // this.checkBeforeAddTerm();
          this.openReviewDialog();
        }, 1000)
      }
    },
    EnterForSearch(){
      if(event.key === 'Enter') {
        this.WorkflowStepsflag = false;
        setTimeout(()=>{
          // this.checkBeforeAddTerm();
          this.openReviewDialog();
        }, 1000)
      }
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
      setTimeout(()=>{
          this.termsReviewDialog = true;
          this.termsReviewDialogPage = 1;
          this.loadingDialog = false;
      },500)

    },
    selectReviewTerms(){
      this.GtrTermsAdded_temp = this.GtrTermsAdded_temp.filter(o1 => this.GtrTermsAdded.every(o2 => {
        return o1.DiseaseName !== o2.DiseaseName
      }));
      this.GtrTermsAdded = [...this.GtrTermsAdded, ...this.GtrTermsAdded_temp];
      this.phenolyzerTermsAdded = [...this.phenolyzerTermsAdded, ...this.phenolyzerTermsAdded_temp];
      this.hpoTermsAdded = [...this.hpoTermsAdded, ...this.hpoTermsAdded_temp];

      this.GtrTermsAdded_temp = [];
      this.phenolyzerTermsAdded_temp = [];
      this.hpoTermsAdded_temp = [];
      console.log("this.GtrTermsAdded", this.GtrTermsAdded)
      var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded];
      this.$emit('saveSearchedPhenotypes', allPhenotypes)

      //Add GTR selected terms from review
      for (var i = this.gtr_push_idx; i < this.GtrTermsAdded.length; i++) {
        var term = this.GtrTermsAdded[i];
        var searchTerm ="";
        var conceptId = ""
        searchTerm = term.DiseaseName;
        conceptId = term.ConceptID;
        if(!this.multipleSearchTerms.includes(searchTerm) && searchTerm!==undefined){
          if(searchTerm.length>1){
            this.multipleSearchTerms.push(searchTerm);
            this.searchTermsObj.push(term);
            this.Gtr_searchTermsObj.push(term);
            this.Gtr_searchTermArray.push(searchTerm);
            // this.$set(this.Gtr_searchTermsObj[this.gtr_push_idx], 'gtrSearchStatus', "Not started");
            this.$set(this.Gtr_searchTermsObj[this.gtr_push_idx], 'gtrSearchStatus', "Searching");
            this.gtr_push_idx = this.gtr_push_idx + 1;
          }
        }
      }

      //Add Phenolyzer selected terms from review
      for (var i = this.phenolyzer_push_idx; i < this.phenolyzerTermsAdded.length; i++) {
        var term = this.phenolyzerTermsAdded[i];
        var searchTerm ="";
        searchTerm = term.value;
        if(!this.multipleSearchTerms.includes(searchTerm) && searchTerm!==undefined){
          if(searchTerm.length>1){
              this.multipleSearchTerms.push(searchTerm);
              this.searchTermsObj.push(term);
              this.Phenolyzer_searchTermsObj.push(term);
              this.Phenolyzer_searchTermArray.push(searchTerm);
              this.$set(this.Phenolyzer_searchTermsObj[this.phenolyzer_push_idx], 'phenolyzerSearchStatus', "Searching");
              this.phenolyzer_push_idx = this.phenolyzer_push_idx + 1;
          }
        }
      }

      this.hpoTermsAdded.map(term => {
        var searchTerm ="";
        searchTerm = term.HPO_Data;
        if(term.hpoSearchStatus!=="Completed" || term.hpoSearchStatus===undefined){
          this.$set(term, 'hpoSearchStatus', "Searching");
          this.$set(term, 'tool_to_search', 'Hpo');
          this.$set(term, 'DiseaseName', term.HPO_Data);
        }

        var res = searchTerm.split(" - ");
        var hpoId = res[1].replace(/[\])}[{(]/g, '').trim();
        var phenoTerm = res[0];
        term.hpoNumber = hpoId;
        term.phenotype = phenoTerm;

        if(!this.multipleSearchTerms.includes(searchTerm) && searchTerm!==undefined){
          if(searchTerm.length>1){
            this.multipleSearchTerms.push(searchTerm);
            this.searchTermsObj.push(term);
            this.Hpo_searchTermsObj.push(term);
            this.Hpo_searchTermArray.push(hpoId);
          }
        }
      })

      this.termsReviewDialog = false;
      this.search = '';
      this.textNotes = '';
      this.termsReviewDialogPage = 0;
      if(this.hpoTermsAdded.length || this.GtrTermsAdded.length || this.phenolyzerTermsAdded.length){
        this.performSearchEvent();
      }
    },
    performSearchEvent(){
      //Check if all saved state is built
      // if built then fire functions to send to summary page and meanwhile start performing search
      if(this.has_saved_state===null){
        //check if all the data from saved state is built in the background or if there is no saved state
        this.Gtr_performSearchEvent();
        this.Phenolyzer_performSearchEvent();
        this.Hpo_performSearchEvent();
        this.searchStatusDialog = true;
      }
      else if(this.has_saved_state){
        //check if all the data from saved state is built in the background
        if(!this.gtrSavedState && !this.phenolyzerSavedState && !this.hpoSavedState){
          //pass all the data from the components to the summary
          this.addDiseases(this.filteredDiseasesItemsArray);
          this.sendPhenolyzerGenesToSummary(this.phenolyzerItems);
          this.sendHpoGenesToSummary(this.hpoItems);

          this.has_saved_state = null; //data from saved state is built in background and no need to checkc this condition again

          this.Gtr_performSearchEvent();
          this.Phenolyzer_performSearchEvent();
          this.Hpo_performSearchEvent();
          this.searchStatusDialog = true;
        }
        else {
          // TODO keep checking if the state is completed
          if(this.gtrSavedState){
            setTimeout(()=>{
              this.performSearchEvent();
            }, 1500)
          }
        }
      }
    },
    Gtr_performSearchEvent(){
      console.log("performing GTR search")
      console.log("this.Gtr_idx", this.Gtr_idx);
      console.log("this.Gtr_searchTermsObj", this.Gtr_searchTermsObj)
      this.gtrFetchCompleted = false;
      // this.Gtr_searchTermsObj.forEach((term, i) => {
      //   ((ind) =>{
      //     setTimeout(() =>{
      //       console.log("term", term)
      //       this.$set(term, 'gtrSearchStatus', "Searching");
      //       bus.$emit("singleTermSearchGTR", term);
      //     }, 200 + (2000 * ind));
      //   })(i);
      // })
      let startVal = this.Gtr_idx;
      for(let i=startVal; i<this.Gtr_searchTermsObj.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            this.$set(this.Gtr_searchTermsObj[i], 'gtrSearchStatus', "Searching");
            bus.$emit("singleTermSearchGTR", this.Gtr_searchTermsObj[i]);
            this.Gtr_idx = this.Gtr_idx + 1;
          }, 200 + (2000 * ind));
        })(i);
      }
    },

    Gtr_performSearchEvent_saved(){
      // this.gtrFetchCompleted = false;
      let startVal = this.Gtr_idx;
      for(let i=startVal; i<this.Gtr_searchTermsObj.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            this.$set(this.Gtr_searchTermsObj[i], 'gtrSearchStatus', "Completed");
            bus.$emit("singleTermSearchGTR", this.Gtr_searchTermsObj[i]);
            this.Gtr_idx = this.Gtr_idx + 1;
          }, 200 + (2000 * ind));
        })(i);
      }
    },

    filteredDiseasesItems(items){
      // this.filteredDiseasesItemsArray.push(items);
      this.filteredDiseasesItemsArray = [...this.filteredDiseasesItemsArray, ...items];
      this.gtr_saved_idx = this.gtr_saved_idx+1;
      // if(this.gtr_saved_idx>this.gtrSavedTermsLength){
      //   this.gtrSavedState = false;
      // }
      // if(!this.gtrSavedState){
      //   this.addDiseases(this.filteredDiseasesItemsArray)
      // }
      if(this.gtr_saved_idx===this.gtrSavedTermsLength){
        this.gtrSavedState = false;
      }
      if(this.gtr_saved_idx>this.gtrSavedTermsLength && !this.gtrSavedState){
        if(items.length){ // length of items is present only when genepanels are there for the search term.
          this.addDiseases(this.filteredDiseasesItemsArray)
        }
      }
      // console.log("this.filteredDiseasesItemsArray", this.filteredDiseasesItemsArray)
    },

    filteredDiseasesItems_removeItem(items){
      this.filteredDiseasesItemsArray = items;
      this.addDiseases(this.filteredDiseasesItemsArray)
    },

    addDiseases: function(e){
      for(var i=0; i<e.length; i++){
        for(var j=e.length-1; j>i; j--){
          {
            if(e[i].Title === e[j].Title){
              e[i].searchTerm = e[i].searchTerm + " " + e[j].searchTerm;
              e[i].searchTermArray = [...e[i].searchTermArray, ...e[j].searchTermArray];
              // e[i].searchTermIndex = [...e[i].searchTermIndex, ...e[j].searchTermIndex];
            }
          }
        }
      }

      //Remove duplicates from the disorders array.
      e = e.filter((disorder, index, self) =>
        index === self.findIndex((t) => (
          t.Title === disorder.Title
        ))
      );
      this.diseasesProps = e;
      if(this.diseasesProps.length>0){
        this.checkForAssociatedGenes();
        this.AddGenePanelData(this.diseasesProps);
      }
      else {
        //make gtr gene list empty
        this.GtrGenesForSummary = [];
        this.items = [];
      }
    },
    checkForAssociatedGenes: function(){
      var temp = [];
      this.diseasesProps.map(x=>{
        if(x.ConceptMeta.AssociatedGenes!==undefined && x.ConceptMeta.AssociatedGenes!=="" && x.ConceptMeta.AssociatedGenes!=="EMPTY_STRING"){
          if(x.ConceptMeta.AssociatedGenes.Gene.__text!==undefined){
            temp.push({
              name: x.ConceptMeta.AssociatedGenes.Gene.__text,
              searchTermIndex: x.searchTermIndex,
              searchTermArray: x.searchTermArray
            })
          }
          else if(x.ConceptMeta.AssociatedGenes.Gene.__text===undefined){
            x.ConceptMeta.AssociatedGenes.Gene.map(y=>{
              temp.push({
                name: y.__text,
                searchTermIndex: x.searchTermIndex,
                searchTermArray: x.searchTermArray
              })
            })
          }
        }
      })
      this.associatedGenes = temp;
    },
    AddGenePanelData: function(){
      //new code

      var mergedGenePanels = model.mergeGenePanelsAcrossDiseases(this.diseasesProps);
      mergedGenePanels.map(x=>{
        if(x.genecount<this.lowerLimit){
          x.filter = "specific";
        }
        else if(x.genecount>=this.lowerLimit && x.genecount<this.upperLimit){
          x.filter = "moderate";
        }
        else if(x.genecount>=this.upperLimit){
          x.filter = "general"
        }
      })

      var temp =[];
      this.selectedPanelFilters.map(x=>{
        mergedGenePanels.map(y=>{
          if(x === y.filter){
            temp.push(y);
          }
        })
      })

      // console.log("mergedGenePanels", mergedGenePanels)
      this.selectPanels(mergedGenePanels);
    },
    selectPanels: function(e){
      // console.log("e in selectPanels", e)
      var temp = [];
      this.selectedPanelFilters.map(x=>{
        e.map(y=>{
          if(x === y.filter){
            temp.push(y);
          }
        })
      })
      this.geneProps = temp; //Selected panels
      // console.log("this.geneProps", this.geneProps);
      this.AddGeneData();
      this.AllSelectedGtrPanels = temp; //Can move this to selectPanelsIndividual if issue exists.
      this.getIndividualRankedGene();
    },
    AddGeneData: function(){
      if(this.associatedGenes.length){
        this.associatedGenes.map(x=>{
          x.omimSrc= `https://www.ncbi.nlm.nih.gov/omim/?term=${x.name}`;
          x.medGenSrc= `https://www.ncbi.nlm.nih.gov/medgen/?term=${x.name}`;
          x.geneCardsSrc= `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${x.name}`;
          x.ghrSrc= `https://ghr.nlm.nih.gov/gene/${x.name}`;
          x.clinGenLink= `https://www.ncbi.nlm.nih.gov/projects/dbvar/clingen/clingen_gene.cgi?sym=${x.name}`;
          // x.htmlData = this.drawHtmlData($('#genes-table').innerWidth());
          x.isAssociatedGene = true;
          x.value = 0;
        })
      }

      this.DataToIncludeSearchTerms = this.geneProps;
      this.arrangedSearchData = this.searchTermsForGeneId(this.DataToIncludeSearchTerms);

      var mergedGenes = model.mergeGenesAcrossPanels(this.geneProps);
      let data = model.getGeneBarChartData(mergedGenes, 850, this.launchedFromClinProps );
      this.GenesToDisplay = data;

      this.arrangeAllData(this.arrangedSearchData, this.GenesToDisplay);

      if(this.associatedGenes.length){
        this.associatedGenes.map(x=>{
          var checkIfAssociatedGeneExist = obj => obj.name === x.name;
          if(data.some(checkIfAssociatedGeneExist)){
            var genes = [];
            data.map(y=>{
              genes.push(y.name);
            });
            var i = genes.indexOf(x.name);
            // x.htmlData = data[i].htmlData;
            x.value = data[i].value;
            x.conditions = data[i].conditions;
            x.diseases = data[i].diseases;
            x.geneid = data[i].geneid;

            data.splice(i, 1);
            data = [...data];
          }
        })
      }

      if(this.associatedGenes.length){

        this.associatedGenes.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0));
        this.items = [...this.associatedGenes, ...data];
      }
      else{
        this.items = data;
      }
      this.noOfSourcesSvg();
      console.log("this.GtrGenesForSummary", this.items);
      this.GtrGenesForSummary = this.items;
      // this.$emit("GtrGeneList", this.items);

    },

    noOfSourcesSvg: function(){
      this.items.map((x, i)=>{
        x.indexVal = i+1;
      });
    },

    arrangeAllData: function(terms, genesData){
      for(var i=0; i<terms.length; i++){
        for(var j=0; j<genesData.length; j++){
          if(terms[i].id == genesData[j].geneid){
            genesData[j].searchTermIndex = terms[i].searchData;
            genesData[j].searchTermArray = terms[i].searchDataTerms;
          }
        }
      }
    },
    searchTermsForGeneId: function(genePanels){
      genePanels.forEach(function(genePanel) {
        genePanel._genes.forEach(function(gene, i) {
          gene["searchTermArray"] = genePanel.searchTermArray;
          gene["searchTermIndex"] = genePanel.searchTermIndex;
        })
      })

      var genesTempArr = [];
      var tempGeneArrId = [];

      genePanels.forEach(function(genePanel) {
        genePanel._genes.forEach(function(gene, i) {
          genesTempArr.push(gene);
          tempGeneArrId.push(gene.geneid)
        })
      })

      var dupsObj = {};

      for(var i=0; i<genesTempArr.length; i++){
        if(dupsObj[genesTempArr[i].geneid]===undefined){
          dupsObj[genesTempArr[i].geneid] = genesTempArr[i];
        }
        else {
          dupsObj[genesTempArr[i].geneid].searchTermIndex = [...dupsObj[genesTempArr[i].geneid].searchTermIndex, ...genesTempArr[i].searchTermIndex];
          dupsObj[genesTempArr[i].geneid].searchTermIndex = Array.from(new Set(dupsObj[genesTempArr[i].geneid].searchTermIndex))
          dupsObj[genesTempArr[i].geneid].searchTermArray = [...dupsObj[genesTempArr[i].geneid].searchTermArray, ...genesTempArr[i].searchTermArray];
          dupsObj[genesTempArr[i].geneid].searchTermArray = Array.from(new Set(dupsObj[genesTempArr[i].geneid].searchTermArray))

        }
      }

      var newGeneArr = [];

      for(var key in dupsObj){
        newGeneArr.push(dupsObj[key])
      }
      var obj = {};
      for(var i=0; i<newGeneArr.length; i++){
        if(obj[newGeneArr[i].geneid]===undefined){
          obj[newGeneArr[i].geneid] = {
            index: newGeneArr[i].searchTermIndex,
            terms: newGeneArr[i].searchTermArray
          }
        }
      }

      var anotherArr = [];
      for(var key in obj){
        anotherArr.push({
          id: key,
          searchData: obj[key].index,
          searchDataTerms: obj[key].terms
        })
      }

      anotherArr.map(x=>{
        x.searchData.sort();
      })
      return anotherArr

    },
    searchTermDiseases:function(diseases){
      this.individualDiseases = diseases;
      this.diseasesPropsIndividual = diseases.filteredDiseases;
      console.log("diseases", diseases)
      this.checkForAssociatedGenesIndividual();
      this.AddGenePanelDataIndividual(this.diseasesPropsIndividual, diseases.searchTerm)
    },
    checkForAssociatedGenesIndividual: function(){
      var temp = [];
      this.diseasesPropsIndividual.map(x=>{
        if(x.ConceptMeta.AssociatedGenes!==undefined && x.ConceptMeta.AssociatedGenes!=="" && x.ConceptMeta.AssociatedGenes!=="EMPTY_STRING"){
          if(x.ConceptMeta.AssociatedGenes.Gene.__text!==undefined){
            temp.push({
              name: x.ConceptMeta.AssociatedGenes.Gene.__text,
              searchTermIndex: x.searchTermIndex,
              searchTermArray: x.searchTermArray
            })
          }
          else if(x.ConceptMeta.AssociatedGenes.Gene.__text===undefined){
            x.ConceptMeta.AssociatedGenes.Gene.map(y=>{
              temp.push({
                name: y.__text,
                searchTermIndex: x.searchTermIndex,
                searchTermArray: x.searchTermArray
              })
            })
          }
        }
      })
      this.associatedGenesIndividual = temp;
    },
    AddGenePanelDataIndividual: function(data, searchTerm){
      //new code
      var mergedGenePanels = model.mergeGenePanelsAcrossDiseases(this.diseasesPropsIndividual);
      mergedGenePanels.map(x=>{
        if(x.genecount<this.lowerLimit){
          x.filter = "specific";
        }
        else if(x.genecount>=this.lowerLimit && x.genecount<this.upperLimit){
          x.filter = "moderate";
        }
        else if(x.genecount>=this.upperLimit){
          x.filter = "general"
        }
      })

      var temp =[];
      this.selectedPanelFilters.map(x=>{
        mergedGenePanels.map(y=>{
          if(x === y.filter){
            temp.push(y);
          }
        })
      })

      // console.log("mergedGenePanels individual", mergedGenePanels, "searchTerm is ", searchTerm)
      // this.selectPanelsIndividual(mergedGenePanels, searchTerm);
      this.createSeparatePanelsObj(mergedGenePanels, searchTerm)
    },
    selectPanelsIndividual: function(e, searchTerm){
      var temp = [];
      this.selectedPanelFilters.map(x=>{
        e.map(y=>{
          if(x === y.filter){
            temp.push(y);
          }
        })
      })
      this.genePropsIndividual = temp; //Selected panels
      // this.AddGeneDataIndividual(searchTerm);
    },

    AddGeneDataIndividual: function(searchTerm){

    },

    createSeparatePanelsObj: function(panels, searchTerm){
      if(this.panelsSearchTermObj[searchTerm]===undefined){
        this.panelsSearchTermObj[searchTerm] = [];
      }
      this.updatePanelsSearchObj(panels, searchTerm);
    },

    updatePanelsSearchObj: function(panels, searchTerm){

      if(!this.panelsSearchTermObj[searchTerm].length){
        this.panelsSearchTermObj[searchTerm] = panels;
      }

      // console.log("individualGenesObjGtr", this.panelsSearchTermObj)
      var idx = this.Gtr_searchTermArray.indexOf(searchTerm);

      if(!panels.length){
        this.$set(this.Gtr_searchTermsObj[idx], 'gtrSearchStatus', "NoGenes");
        this.Gtr_search_complete_idx = this.Gtr_search_complete_idx+1;
      }
      else {
        this.$set(this.Gtr_searchTermsObj[idx], 'gtrSearchStatus', "Completed");
        this.Gtr_search_complete_idx = this.Gtr_search_complete_idx+1;
      }

      if(this.Gtr_search_complete_idx === this.Gtr_searchTermArray.length){
        this.gtrFetchCompleted = true;
        this.checkToCloseSearchStatusDialog();
      }

      // console.log("this.panelsSearchTermObj", this.panelsSearchTermObj)
      // this.$emit('individualPanelsSearchObj', this.panelsSearchTermObj)
      this.individualPanelsSearchObj(this.panelsSearchTermObj);
    },

    individualPanelsSearchObj: function(panels){
      this.individualGtrPanelsSearchObj = panels;
    },

    currentSearchTerm: function(term){
      this.currentSearchedTerm = term;
    },

    Phenolyzer_performSearchEvent(){
      this.phenolyzerFetchCompleted = false;
      let startVal = this.Phenolyzer_idx;
      for(let i=startVal; i<this.Phenolyzer_searchTermsObj.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var term = this.Phenolyzer_searchTermsObj[i];
            var str = term.value.replace("-", " ").replace(/\s\s+/g, ' ').toLowerCase();
            bus.$emit("singleTermSearchPhenolyzer", str);
            this.Phenolyzer_idx = this.Phenolyzer_idx + 1;
          }, 200 + (2000 * ind));
        })(i);
      }
    },

    Phenolyzer_performSearchEvent_saved(){
      // this.phenolyzerFetchCompleted = false;
      let startVal = this.Phenolyzer_idx;
      for(let i=startVal; i<this.Phenolyzer_searchTermsObj.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var term = this.Phenolyzer_searchTermsObj[i];
            var str = term.value.replace("-", " ").replace(/\s\s+/g, ' ').toLowerCase();
            bus.$emit("singleTermSearchPhenolyzer", str);
            this.Phenolyzer_idx = this.Phenolyzer_idx + 1;
          }, 200 + (2000 * ind));
        })(i);
      }
    },

    phenolyzerIndividualGenes(genes){
      // TODO: event should be individualGenesObjPhenolyzer from phenolyzer
    },

    PhenolyzerFullGeneList(genes){
      this.phenolyzerItems = genes;
      this.phenolyzer_saved_idx = this.phenolyzer_saved_idx+1;
      if(this.phenolyzer_saved_idx===this.phenolyzerSavedTermsLength){
        this.phenolyzerSavedState = false;
      }
      if(this.phenolyzer_saved_idx>this.phenolyzerSavedTermsLength){ //Ensures that summary component is called only after state is built from the saved object.
        this.sendPhenolyzerGenesToSummary(this.phenolyzerItems);
      }
    },

    sendPhenolyzerGenesToSummary(genes){
      this.PhenolyzerGenesForSummary = genes;
    },

    Hpo_performSearchEvent(){
      this.hpoFetchCompleted = false;
      let startVal = this.Hpo_idx;
      for(let i=startVal; i<this.Hpo_searchTermsObj.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var term = this.Hpo_searchTermsObj[i];
            bus.$emit("singleTermSearchHPO", term);
            this.Hpo_idx = this.Hpo_idx + 1;
          }, 200 + (2000 * ind));
        })(i);
      }
    },

    Hpo_performSearchEvent_saved(){
      // this.hpoFetchCompleted = false;
      console.log("performing saved search")
      let startVal = this.Hpo_idx;
      for(let i=startVal; i<this.Hpo_searchTermsObj.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var term = this.Hpo_searchTermsObj[i];
            bus.$emit("singleTermSearchHPO", term);
            this.Hpo_idx = this.Hpo_idx + 1;
          }, 200 + (2000 * ind));
        })(i);
      }
    },

    HpoFullGeneList(genes){
      // console.log("HpoFullGeneList", genes)
      this.hpoItems = genes;
      this.hpo_saved_idx = this.hpo_saved_idx+1;
      if(this.hpo_saved_idx===this.hpoSavedTermsLength){
        this.hpoSavedState = false;
      }
      if(this.hpo_saved_idx>this.hpoSavedTermsLength){ //Ensures that summary component is called only after state is built from the saved object.
        this.sendHpoGenesToSummary(genes)
      }
    },

    sendHpoGenesToSummary(genes){
      this.clinPhenSelectedGenes = genes;
    },

    hpoIndividualGenes(obj){

    },

    checkToCloseSearchStatusDialog(){
      if(this.gtrFetchCompleted && this.phenolyzerFetchCompleted && this.hpoFetchCompleted){
        setTimeout(()=>{
          this.searchStatusDialog = false;
        }, 3000)
      }
      else if(this.gtrFetchCompleted && !this.phenolyzerFetchCompleted && !this.hpoFetchCompleted){
        setTimeout(()=>{
          this.searchStatusDialog = false;
        }, 3000)
      }
      else if(this.phenolyzerFetchCompleted && !this.gtrFetchCompleted && !this.hpoFetchCompleted){
        setTimeout(()=>{
          this.searchStatusDialog = false;
        }, 3000)
      }
      else if(this.hpoFetchCompleted && !this.gtrFetchCompleted && !this.phenolyzerFetchCompleted){
        setTimeout(()=>{
          this.searchStatusDialog = false;
        }, 3000)
      }
    },

    individualGenesObjPhenolyzer:function(obj){
      this.individualGenesSearchTermPhenolyzer = obj;
    },

    individualGenesObjHpo: function(obj){
      this.individualGenesSearchTermHpo = obj;
    },

    getIndividualRankedGene(){
      var panelsId = [];
      this.AllSelectedGtrPanels.map(x=>{
        panelsId.push(x.id)
      })
      for(const prop in this.individualGtrPanelsSearchObj){
        if(this.selectedObj[prop]===undefined){
          this.selectedObj[prop] = []
        }
      }

    for(const prop in this.individualGtrPanelsSearchObj){
      var temp = [];
      this.individualGtrPanelsSearchObj[prop].map(x=>{
        if(panelsId.includes(x.id)){
          temp.push(x);
        }
      })

      var obj = {};
      var len = temp.length;
      for ( var i=0; i < len; i++ )
          obj[temp[i]['id']] = temp[i];
      var y  = new Array();
      for ( var key in obj )
          y.push(obj[key]);
      this.selectedObj[prop] = y;
      }
      // console.log("this.selectedObj", this.selectedObj)
    },

    stopPhenolyzerSearch(term){
      bus.$emit('stopPhenolyzerQueued', term);
    },


    remove(item, idx, component){

        if(component === 'GTR'){
          if(this.has_saved_state){ //Ensures that genes of other tools are passed to the summary to built the list
            if(!this.phenolyzerSavedState && !this.hpoSavedState){
              this.sendPhenolyzerGenesToSummary(this.phenolyzerItems);
              this.sendHpoGenesToSummary(this.hpoItems);
              this.has_saved_state = null; //data from saved state is built in background and no need to check this condition again
            }
            else{
              setTimeout(()=>{
                this.remove(item, idx, component); //Test this condition
              }, 1500)
            }
          }
          bus.$emit('pass_filteredDiseasesItems', this.diseasesProps)
          bus.$emit("removeGtrTerm", item.DiseaseName)
          this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(item.DiseaseName), 1)
          this.multipleSearchTerms = [...this.multipleSearchTerms];
          this.GtrTermsAdded.splice(idx, 1)
          this.GtrTermsAdded = [...this.GtrTermsAdded];
          this.Gtr_searchTermsObj.splice(idx, 1);
          this.Gtr_searchTermsObj = [...this.Gtr_searchTermsObj];
          this.Gtr_searchTermArray.splice(idx, 1);
          this.Gtr_searchTermArray = [...this.Gtr_searchTermArray];
          this.Gtr_idx = this.Gtr_idx - 1;
          this.gtr_push_idx = this.gtr_push_idx - 1;
        }

        else if(component === 'phenolyzer'){
          if(this.has_saved_state){ //Ensures that genes of other tools are passed to the summary to built the list
            if(!this.gtrSavedState && !this.hpoSavedState){
              this.addDiseases(this.filteredDiseasesItemsArray);
              this.sendHpoGenesToSummary(this.hpoItems);
              this.has_saved_state = null; //data from saved state is built in background and no need to check this condition again
            }
            else{
              setTimeout(()=>{
                this.remove(item, idx, component); //Test this condition
              }, 1500)
            }
          }
          bus.$emit("removePhenolyzerTerm", item.value)
          this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(item.value), 1)
          this.multipleSearchTerms = [...this.multipleSearchTerms];
          this.phenolyzerTermsAdded.splice(idx, 1)
          this.phenolyzerTermsAdded = [...this.phenolyzerTermsAdded];
          this.Phenolyzer_searchTermsObj.splice(idx, 1);
          this.Phenolyzer_searchTermsObj = [...this.Phenolyzer_searchTermsObj];
          this.Phenolyzer_searchTermArray.splice(idx, 1);
          this.Phenolyzer_searchTermArray = [...this.Phenolyzer_searchTermArray];
          this.Phenolyzer_idx = this.Phenolyzer_idx - 1;
          this.phenolyzer_push_idx = this.phenolyzer_push_idx - 1;
        }

        else if(component === 'HPO'){
          if(this.has_saved_state){ //Ensures that genes of other tools are passed to the summary to built the list
            if(!this.gtrSavedState && !this.phenolyzerSavedState){
              this.addDiseases(this.filteredDiseasesItemsArray);
              this.sendPhenolyzerGenesToSummary(this.phenolyzerItems);
              this.has_saved_state = null; //data from saved state is built in background and no need to check this condition again
            }
            else{
              setTimeout(()=>{
                this.remove(item, idx, component); //Test this condition
              }, 1500)
            }
          }
          bus.$emit("removeHpoTerm", item)
          this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(item.HPO_Data), 1)
          this.multipleSearchTerms = [...this.multipleSearchTerms];
          this.hpoTermsAdded.splice(idx, 1)
          this.hpoTermsAdded = [...this.hpoTermsAdded];
          this.Hpo_searchTermsObj.splice(idx, 1);
          this.Hpo_searchTermsObj = [...this.Hpo_searchTermsObj];
          this.Hpo_searchTermArray.splice(idx, 1);
          this.Hpo_searchTermArray = [...this.Hpo_searchTermArray];
          this.Hpo_idx = this.Hpo_idx - 1;
        }

        var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded];
        this.$emit('saveSearchedPhenotypes', allPhenotypes)

      }, //end remove() method

  }
};
</script>


<style lang="sass">
  @import url('https://fonts.googleapis.com/css?family=Poppins&display=swap')

  body, .v-application
    font-family: 'Poppins', sans-serif

  .v-application--wrap
    font-family: 'Poppins', sans-serif

  .v-btn
    text-transform: none

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

  .open>.dropdown-menu
    padding-left: 0px !important

  .dropdown-menu>.active>a
    background-color: #45688e

  .v-chip__close.v-icon.v-icon--right
    color: white !important
</style>
