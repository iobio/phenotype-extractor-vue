<template>
  <v-container>

    <div class="row">
      <div class="col-md-12">
        <v-text-field
          outlined
          type="text"
          id="single_entry_input"
          ref="single_entry_input"
          v-model="textNotes"
          autocomplete="off"
          v-show="textNotes.length<45"
          placeholder="Enter Phenotypes or Type (paste) Clinical Note"
        >
          <template v-slot:append-outer>
            <v-btn style="margin-top:-10px" large :disabled="textNotes.length<4" @click="extract" color="primary">Submit</v-btn>
          </template>
        </v-text-field>
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
        <v-textarea
          v-show="textNotes.length>=45"
          v-model="textNotes"
          ref="single_entry_input_textarea"
          id="single_entry_input_textarea"
          name="input-7-4"
          rows="2"
          outlined
        >
        <template v-slot:append-outer>
          <v-btn style="margin-top:-10px" large :disabled="textNotes.length<4" @click="extract" color="primary">Submit</v-btn>
        </template>
      </v-textarea>
      </div>
    </div>
    
    
    <!-- Tabs sections -->
    <v-tabs
      color="primary"
      slider-color="primary"
      v-model="tab_idx"
    >
      <v-tab>
        <strong>Input</strong>
      </v-tab>
      <v-tab>
        <strong>HPO</strong>
      </v-tab>
    </v-tabs>
    
    <div>
      <!-- <div v-show="tab_idx===0">  -->
      <div > 
        <div >
          <div>

            <div class="col-container row" >
              
              <!-- flex-text-note  -->
              <v-card class="col-flex-note" v-show="tab_idx===0">
                <v-card-title primary-title>
                  <strong class="terms-heading primary--text" style="font-size: 16px">
                    Inputs
                  </strong>

                  <!-- <span class="terms-heading">
                    Inputs
                    <v-badge
                      :value="clinical_note_text.length"
                      color="#888"
                      left
                      class="ml-7 mb-2"
                    >
                      <span slot="badge">{{ clinical_note_text.length }}</span>
                    </v-badge>
                  </span> -->
                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text class="i-clinical_note_text_div">
                  <div v-if="showSearchTermsLoader">
                    <blockquote class="blockquote">
                      <v-skeleton-loader
                        :loading="loading"
                        :transition="transition"
                        type="paragraph"
                      >
                      </v-skeleton-loader>
                    </blockquote>
                  </div>
                  <div v-if="!showSearchTermsLoader">
                    <div v-if="clinical_note_text.length">
                      <div v-for="(note, i) in clinical_note_text" :key="i" class=" i-text--left row" style="font-size: 13px;">
                        <div class="col-md-1" style="padding: 5px; padding-left: 11px">
                          {{i + 1}}
                        </div>
                        <div class="col-md-9" style="padding: 5px; margin-left: -5px">
                          {{ note.note | to-firstCharacterUppercase }}
                        </div>
                        <div class="col-md-1" style="padding: 5px;">
                          <span @click="reSelectClinicalNote(note.note, i)">
                            <v-btn text color="primary" small>
                              <span>
                                <v-icon small style="font-size:11px">edit</v-icon>
                               </span>
                             </v-btn>
                          </span>
                        </div>
                        <div class="col-md-1" style="padding: 5px;">
                          <span @click="confirmToDeleteInputNote(note.note, i)">
                            <v-btn text color="primary" small>
                              <span>
                                <v-icon small style="font-size:11px">delete</v-icon>
                               </span>
                             </v-btn>
                          </span>
                        </div>
                         
                      </div>
                    </div>
                    <div v-else>
                      <MissingNoteIcon />
                      <center class="mt-2 ml-5"> No clinical note added</center>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <!-- end flex text note -->


              <!-- flex hpo visualizations  -->
              <v-card class="col-flex-terms" v-show="tab_idx===1">
                <v-card-title primary-title style="margin-bottom: -30px;">

                  <strong class="terms-heading primary--text" style="font-size: 16px">
                    Genes overlap with terms
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" small style="font-size:16px; opacity: 0.8" class="ml-1">info_outline</v-icon>
                      </template>
                      <span>
                        Help text
                      </span>
                    </v-tooltip>      
                  </strong>

                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text class="i-clinical_note_viz_div">
                  <div v-show="showSearchTermsLoader">
                    <blockquote class="blockquote">
                      <v-skeleton-loader
                        :loading="loading"
                        :transition="transition"
                        type="paragraph"
                      >
                      </v-skeleton-loader>
                    </blockquote>
                  </div>
                  <div v-show="!showSearchTermsLoader">
                    <div v-show="Hpo_searchTermsObj.length">
                      <div class="hpo-genes-bar-chart" style="text-align: center;">
                        
                      </div>
                    </div>
                    <div v-show="!Hpo_searchTermsObj.length" style="margin-top:30px">
                      <div v-if="tab_idx === 1">
                        <MissingNoteVizIcon />
                      </div>
                      <center class="mt-2 ml-5"> No HPO terrms added</center>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <!-- end flex hpo distribution visualizations -->
              
              
              <!-- flex hpo distribution visualizations  -->
              <v-card class="col-flex-terms" v-show="tab_idx===1">
                <v-card-title primary-title style="margin-bottom: -30px;">

                  <strong class="terms-heading primary--text" style="font-size: 16px">
                    Gene specificity score
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" small style="font-size:16px; opacity: 0.8" class="ml-1">info_outline</v-icon>
                      </template>
                      <span>
                        Help text
                      </span>
                    </v-tooltip>      
                  </strong>

                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text class="i-clinical_note_viz_div">
                  <div v-show="showSearchTermsLoader">
                    <blockquote class="blockquote">
                      <v-skeleton-loader
                        :loading="loading"
                        :transition="transition"
                        type="paragraph"
                      >
                      </v-skeleton-loader>
                    </blockquote>
                  </div>
                  <div v-show="!showSearchTermsLoader">
                    <div v-show="Hpo_searchTermsObj.length">
                      <div class="hpo-histogram" style="text-align: center;">
                        
                      </div>
                    </div>
                    <div v-show="!Hpo_searchTermsObj.length" style="margin-top:30px">
                      <MissingNoteVizIcon/>
                      <center class="mt-2 ml-5"> No HPO terrms added</center>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <!-- end flex hpo visualizations -->
              
                            
              <!-- flex-gtr-terms -->
              <v-card class="col-flex-terms"  v-show="tab_idx===0">
                <v-card-title primary-title>
                  <strong class="terms-heading primary--text" style="font-size: 16px">
                    GTR
                  </strong>
                  <v-spacer></v-spacer>
                  <div style="color:#ababab" v-if="Gtr_searchTermsObj.length">
                    <span><h4 style="display:inline"> {{Gtr_searchTermsObj.length}} </h4> </span> 
                    <span style="font-size:12px">terms</span>
                  </div>
                </v-card-title>
                <v-card-text class="search_status_tbody">
                  <div v-if="showSearchTermsLoader">
                    <v-skeleton-loader
                      :loading="loading"
                      :transition="transition"
                      type="chip"
                      class="mt-2"
                    >
                    </v-skeleton-loader>
                  </div>
                  <div class="">
                    <div v-if="!showSearchTermsLoader && Gtr_searchTermsObj.length" v-for="(term, i) in Gtr_searchTermsObj" :key="i" >
                      <div class="row " style="margin-bottom: -8px; margin-top: -8px">
                        <div class="col-md-1" style="padding-top: 5px;">
                          <span v-if="term.gtrSearchStatus==='Searching'">
                            <v-progress-circular
                              :width="2"
                              :size="18"
                              indeterminate
                              color="primary"
                            ></v-progress-circular>
                          </span>
                          <span v-else-if="term.gtrSearchStatus==='Completed'">
                            <v-icon color="green" style="font-weight: bolder; font-size:18px"">done</v-icon>
                          </span>
                          <span v-else-if="term.gtrSearchStatus==='NoGenes'">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon color="grey" style="font-size:20px" v-on="on">block</v-icon>
                              </template>
                              <span>No genes were found for this term</span>
                            </v-tooltip>
                          </span>
                          <span v-else-if="term.gtrSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                          <span v-else>
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon color="gray lighten-4" v-on="on">error</v-icon>
                              </template>
                              <span>The network request for this term failed. Please delete this term and try again.</span>
                            </v-tooltip>
                          </span>
                        </div>
                        <div class="col-md-9" style="padding-top: 5px;" @mouseover="mouseOverGtrTerm(term.DiseaseName)" @mouseleave="hovered_gtr_term=''">
                          <div class="ml-1" style="text-align: left !important; font-size: 13px" >
                            <span>{{ term.DiseaseName }}</span>
                          </div>
                        </div>
                        <div class="col-md-1" style="padding-top: 5px;" @mouseover="mouseOverGtrTerm(term.DiseaseName)" @mouseleave="hovered_gtr_term=''">
                          <v-btn text color="primary" small>
                            <span>
                              <v-icon small style="font-size:11px" class="ml-1" @click="removePhenotypeShowDialog(term, i, 'GTR')">delete</v-icon>
                            </span>
                          </v-btn>
                        </div>
                      </div>

                    </div>
                    <div v-if="Gtr_searchTermsObj.length<1">
                      <span v-if="!showSearchTermsLoader">
                        <MissingTermsIcon tab="0">
                        </MissingTermsIcon>
                        <p style="text-align: center;"><center>Not Selected...</center></p>
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <!-- end flex gtr terms -->
              


              <!-- flex-Phenolyzer-terms -->
              <v-card class="col-flex-terms"  v-show="tab_idx===0">
                <v-card-title primary-title>
                  <strong class="terms-heading primary--text" style="font-size: 16px">
                    Phenolyzer
                  </strong>
                  <v-spacer></v-spacer>
                  <div style="color:#ababab" v-if="Phenolyzer_searchTermsObj.length">
                    <span><h4 style="display:inline"> {{Phenolyzer_searchTermsObj.length}} </h4> </span> 
                    <span style="font-size:12px">terms</span>
                  </div>
                </v-card-title>
                <v-card-text class="search_status_tbody">
                  <div v-if="showSearchTermsLoader">
                    <v-skeleton-loader
                      :loading="loading"
                      :transition="transition"
                      type="chip"
                      class="mt-2"
                    >
                    </v-skeleton-loader>
                  </div>
                  <div class="">
                    <div v-if="!showSearchTermsLoader && Phenolyzer_searchTermsObj.length" v-for="(term, i) in Phenolyzer_searchTermsObj" :key="i" >
                      <div class="row " style="margin-bottom: -8px; margin-top: -8px">
                        <div class="col-md-1" style="padding-top: 5px;">
                          <span v-if="term.phenolyzerSearchStatus==='Searching'">
                            <v-progress-circular
                              :width="2"
                              :size="18"
                              indeterminate
                              color="primary"
                            ></v-progress-circular>
                          </span>
                          <span v-else-if="term.phenolyzerSearchStatus==='running'">
                            <v-progress-circular
                              :width="2"
                              :size="18"
                              indeterminate
                              color="primary"
                            ></v-progress-circular>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <span @click="stopPhenolyzerSearch(term.value)">
                                  <v-icon small color="grey" style="font-size:18px; cursor: pointer" v-on="on">cancel</v-icon>
                                </span>
                              </template>
                              <span>Cancel search for this term</span>
                            </v-tooltip>
                          </span>
                          <span v-else-if="term.phenolyzerSearchStatus==='Completed'">
                            <v-icon color="green" style="font-weight: bolder; font-size:18px"">done</v-icon>
                          </span>
                          <span v-else-if="term.phenolyzerSearchStatus==='NoGenes'">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon color="grey" style="font-size:18px" v-on="on">block</v-icon>
                              </template>
                              <span>No genes were found for this term</span>
                            </v-tooltip>
                          </span>
                          <span v-else-if="term.phenolyzerSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                          <span v-else-if="term.phenolyzerSearchStatus==='Cancelled'">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon small color="gray lighten-4" style="font-size:18px; cursor: pointer" v-on="on">error_outline</v-icon>
                              </template>
                              <span>Search for this term was cancelled</span>
                            </v-tooltip>
                          </span>
                          <span v-else>
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon color="gray lighten-4" v-on="on">error</v-icon>
                              </template>
                              <span>The network request for this term failed. Please delete this term and try again.</span>
                            </v-tooltip>
                          </span>
                        </div>
                        <div class="col-md-9" style="padding-top: 5px;" @mouseover="mouseOverPhenolyzerTerm(term.value)" @mouseleave="hovered_phenolyzer_term=''">
                          <div class="ml-1" style="text-align: left !important; font-size: 13px" >
                            <span>{{ term.value | to-firstCharacterUppercase }}</span>
                          </div>
                        </div>
                        <!-- <div class="col-md-1" style="padding-top: 5px;" @mouseover="mouseOverPhenolyzerTerm(term.value)" @mouseleave="hovered_phenolyzer_term=''">
                          <div >
                            <span v-if="hovered_phenolyzer_term === term.value">
                              <v-icon class="ml-1 terms_delete_btn" @click="removePhenotypeShowDialog(term, i, 'phenolyzer')">delete</v-icon>
                            </span>
                          </div>
                        </div> -->
                        <div class="col-md-1" style="padding-top: 5px;" @mouseover="mouseOverPhenolyzerTerm(term.value)" @mouseleave="hovered_phenolyzer_term=''">
                          <v-btn text color="primary" small>
                            <span>
                              <v-icon small style="font-size:11px" class="ml-1" @click="removePhenotypeShowDialog(term, i, 'phenolyzer')">delete</v-icon>
                            </span>
                          </v-btn>
                        </div>                        

                      </div>

                    </div>
                    <div v-if="Phenolyzer_searchTermsObj.length<1">
                      <span v-if="!showSearchTermsLoader">
                        <MissingTermsIcon tab="0">
                        </MissingTermsIcon>
                        <p style="text-align: center;"><center>Not Selected...</center></p>
                      </span>
                    </div>

                  </div>
                </v-card-text>
              </v-card>
              <!-- end flex phenolyzer terms -->     
              
              
              <!-- flex-hpo-terms -->
              <v-card class="col-flex-terms"  v-show="tab_idx===0 || tab_idx===1">
                <v-card-title primary-title>
                  <strong class="terms-heading primary--text" style="font-size: 16px">
                    HPO
                  </strong>
                  <v-spacer></v-spacer>
                  <div style="color:#ababab" v-if="Hpo_searchTermsObj.length">
                    <span><h4 style="display:inline"> {{Hpo_searchTermsObj.length}} </h4> </span> 
                    <span style="font-size:12px">terms</span>
                  </div>
                </v-card-title>
                <v-card-text class="search_status_tbody">
                  <div v-if="showSearchTermsLoader">
                    <v-skeleton-loader
                      :loading="loading"
                      :transition="transition"
                      type="chip"
                      class="mt-2"
                    >
                    </v-skeleton-loader>
                  </div>
                  <div class="">
                    <div v-if="!showSearchTermsLoader && Hpo_searchTermsObj.length" v-for="(term, i) in Hpo_searchTermsObj" :key="i" >
                      <div class="row " style="margin-bottom: -8px; margin-top: -8px">
                        <div class="col-md-1" style="padding-top: 5px;">
                          <span v-if="term.hpoSearchStatus==='Searching'">
                            <v-progress-circular
                              :width="2"
                              :size="18"
                              indeterminate
                              color="primary"
                            ></v-progress-circular>
                          </span>
                          <span v-else-if="term.hpoSearchStatus==='Completed'">
                            <v-icon color="green" style="font-weight: bolder; font-size:18px"">done</v-icon>
                          </span>
                          <span v-else-if="term.hpoSearchStatus==='NoGenes'">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon color="grey" style="font-size:20px" v-on="on">block</v-icon>
                              </template>
                              <span>No genes were found for this term</span>
                            </v-tooltip>
                          </span>
                          <span v-else-if="term.hpoSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                          <span v-else>
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <v-icon color="gray lighten-4" v-on="on">error</v-icon>
                              </template>
                              <span>The network request for this term failed. Please delete this term and try again.</span>
                            </v-tooltip>
                          </span>
                        </div>
                        <div class="col-md-9" style="padding-top: 5px;" @mouseover="mouseOverHpoTerm(term.HPO_Data)" @mouseleave="hovered_hpo_term=''">
                          <div class="ml-1" style="text-align: left !important; font-size: 13px" >
                            <span>{{ term.phenotype }} <br> [{{ term.hpoNumber }}]</span>
                          </div>
                        </div>
                        <div class="col-md-1" style="padding-top: 5px;" @mouseover="mouseOverHpoTerm(term.HPO_Data)" @mouseleave="hovered_hpo_term=''">
                          <v-btn text color="primary" small>
                            <span>
                              <v-icon small style="font-size:11px" class="ml-1" @click="removePhenotypeShowDialog(term, i, 'HPO')">delete</v-icon>
                            </span>
                          </v-btn>
                        </div>                        
                      </div>
                    </div>
                    <div v-if="Hpo_searchTermsObj.length<1">
                      <span v-if="!showSearchTermsLoader">
                        <MissingTermsIcon :tab="tab_idx">
                        </MissingTermsIcon>
                        <p style="text-align: center;"><center>Not Selected...</center></p>
                      </span>
                    </div>

                  </div>
                </v-card-text>
              </v-card>
              <!-- end flex hpo terms -->                       

            </div>
          </div>
        </div>
      </div>
      <!-- <div v-show="tab_idx===1">
        <v-card>
          <v-card-text flat>
            <div class="hpo-genes-bar-chart">
              
            </div>
            
          </v-card-text>
        </v-card>
      </div> -->
    </div>


      <!-- <div v-if="showInfoThatStepIsComplete">
        the following alert shows that the step is completed
        <v-alert
          border="left"
          colored-border
          color="primary"
          elevation="4"
          style="font-size:14px"
          dismissible
          v-model="showInfoThatStepIsComplete"
        >
          <center>
            <span class="ml-4">
              A list of genes associated with the phenotypes and conditions from the clinical note is generated and shown below.  
              It will be used in the next step of the workflow <i>(Review Variants)</i> to show association. You can select upto 50 genes from the compiled list to be reviewed. Top 25 genes will be selected by default.
              <br>
            </span>
            <span class="ml-4">  
              You can now mark this step as complete by clicking the checkbox in the navigation panel above 
              or update the gene list by adding or deleting the search terms. 
            </span>
          </center>
        </v-alert>
      </div> -->



      <!-- Loading dialog box -->
      <!-- TODO: persistent is removed temp -->
        <v-dialog
          v-model="loadingDialog"
          hide-overlay
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
            max-width="1150px"
            transition="dialog-transition"
          >
            <v-card>
              <v-card-title class="grey lighten-2">
                <div v-if="termsReviewDialogPage===0">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">sort</v-icon> Review Gene List Generation
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===1">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">sort</v-icon> GTR (Genetic Testing Registry)
                    <v-badge
                      :value="GtrTermsAdded_temp.length"
                      color="#888"
                      left
                      class="ml-7 mb-2"
                    >
                      <span slot="badge">{{ GtrTermsAdded_temp.length }}</span>
                    </v-badge>
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===2">
                  <div class="pa-2">
                    <svg height="28px" width="28px" style="margin-bottom:-8px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.78 16.42"><defs></defs><title>Asset 7</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><polygon class="cls-1" points="0.5 14.57 9.28 15.84 9.28 0.58 0.5 1.85 0.5 14.57"/><text class="cls-2" transform="translate(2.04 11.92) scale(0.83 1)">P</text></g></g></svg>
                    Phenolyzer
                    <v-badge
                      :value="phenolyzerTermsAdded_temp.length"
                      color="#888"
                      left
                      class="ml-7 mb-2"
                    >
                      <span slot="badge">{{ phenolyzerTermsAdded_temp.length }}</span>
                    </v-badge>
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===3">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">speaker_notes</v-icon> HPO (Human Phenotype Ontology) powered by <a href="http://bejerano.stanford.edu/clinphen/">ClinPhen</a>
                    <v-badge
                      :value="hpoTermsAdded_temp.length"
                      color="#888"
                      left
                      class="ml-7 mb-2"
                    >
                      <span slot="badge">{{ hpoTermsAdded_temp.length }}</span>
                    </v-badge>
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===4">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">rate_review</v-icon> Review
                  </div>
                </div>


                <v-spacer></v-spacer>
                <span>
                  <v-btn text icon @click="closeReviewDialog"><v-icon>close</v-icon></v-btn>
                </span>

              </v-card-title>
              <v-card-title style="margin-bottom:-40px">
                <v-card-text>
                  <div>
                    <span class="mb-4" style="color:rgb(135 135 135)"> Clinical Note</span>
                    
                    <div style="word-wrap: break-word; padding-top: 8px;font-size: 0.975rem; word-break: break-word">
                      {{ textNotes }}
                    </div>
                    <hr>
                    <!-- <blockquote class="blockquote i-text--left" style="font-size: 13px; word-break: break-word; padding: 16px 24px 16px 24px">
                    </blockquote> -->
                    <div v-if="hpoTermsDetected && !reReviewClinicalNote && termsReviewDialogPage===0" class="hpo-terms-detected-card">
                      <v-card class="mb-7 elevation-2">
                        <v-card-title primary-title class="primary" style="color: white; padding-bottom: 5px !important; padding-top: 5px !important; font-size: 14px">
                          HPO terms detected
                        </v-card-title>
                        <v-card-text style="padding-bottom: 1px !important; padding-top: 1px !important">
                          <v-radio-group v-model="hpo_radios" mandatory>
                            <v-radio label="Select inputted HPO terms only" value="inputted_hpo_only"></v-radio>
                            <v-radio label="Use terms from all sources" value="all_sources_terms"></v-radio>
                          </v-radio-group>
                        </v-card-text>
                      </v-card>
                    </div>
                  </div>
                </v-card-text>
              </v-card-title>
              
              <v-card-title v-if="termsReviewDialogPage!==0">
                <v-card-text>
                  <!-- <div v-if="extractedTermsObj.length && termsReviewDialogPage===0"> this is backup code-->

                  <!-- <div class="mt-1 mb-1" v-if="extractedTermsObj.length && termsReviewDialogPage===0">
                    <span> 
                      <v-alert
                        dense
                        text dismissible
                        color="primary"
                        style="font-size:12px; word-break:break-word"
                      >
                      The phenotypes selected from this list will be used to match and select the closest terms in the "GTR", "Phenolyzer" and "HPO" tool. It is very likely that each of the phenotype listed below has additional variants in each tool or synonyms in HPO tool. You can refine or make additional selections in advance mode by clicking the "Refine terms" button below or from the "Review page".
                      </v-alert>

                    </span>

                    <div v-if="basicModeTermsAdded_temp.length>0">
                      <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                      <span v-for="(term, i) in basicModeTermsAdded" v-if="basicModeTermsAdded.length">
                      </span>
                      <span v-for="(term, i) in basicModeTermsAdded_temp" v-if="basicModeTermsAdded_temp.length">
                        <v-chip v-if="reReviewClinicalNote && note_reselect_basicModeTerms_Array.includes(term.DiseaseName)" class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeSelectedTermFromReview(term, i, 'BasicMode')">
                          {{ term.DiseaseName }}
                        </v-chip>
                        <v-chip v-else class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'BasicMode')">
                          {{ term.DiseaseName }}
                        </v-chip>
                      </span>
                      <br>
                      <span v-if="basicModeTermsAdded.length +  basicModeTermsAdded_temp.length >= 5"> 
                        <v-chip
                          class="ma-2"
                          color="#FAF4CA"
                          label
                          small
                          style="border-color: rgb(250, 244, 202);"
                        >
                          Select upto 5 phenotypes for optimal performance 
                        </v-chip>
                      </span>
                    </div>
                  </div> -->
                  
                  <div  class="mt-1 mb-1" v-if="GtrReviewTerms.length && termsReviewDialogPage===1">
                    <div v-if="GtrTermsAdded_temp.length>0">
                      <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                      <span v-for="(term, i) in GtrTermsAdded" v-if="GtrTermsAdded.length">
                      </span>
                      <span v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                        <v-chip v-if="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(term.DiseaseName)" class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeSelectedTermFromReview(term, i, 'GTR')">
                          {{ term.DiseaseName }}
                        </v-chip>
                        <v-chip v-else class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'GTR')">
                          {{ term.DiseaseName }}
                        </v-chip>
                      </span>
                      <br>
                      <span v-if="GtrTermsAdded.length +  GtrTermsAdded_temp.length >= 5"> 
                        <v-chip
                          class="ma-2"
                          color="#FAF4CA"
                          label
                  				small
                          style="border-color: rgb(250, 244, 202);"
                        >
                          Select up to 5 conditions for optimal performance in GTR 
                        </v-chip>
                      </span>
                    </div>
                  </div>

                  <div class="mt-1 mb-1" v-if="phenolyzerReviewTerms.length && termsReviewDialogPage===2">
                    <div v-if="phenolyzerTermsAdded_temp.length>0">
                      <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                      <span v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                        <v-chip v-if="reReviewClinicalNote && note_reselect_phenolyzerTerms_Array.includes(term.value)" class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeSelectedTermFromReview(term, i, 'phenolyzer')">
                          {{ term.value }}
                        </v-chip>
                        <v-chip v-else class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'phenolyzer')">
                          {{ term.value }}
                        </v-chip>
                      </span>
                    </div>
                  </div>

                  <div class="mt-1 mb-1" v-if="HpoReviewTerms.length && termsReviewDialogPage===3">
                    <div v-if="hpoTermsAdded_temp.length>0">
                      <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                      <span v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                        <v-chip v-if="reReviewClinicalNote && note_reselect_hpoTerms_Array.includes(term.HPO_Data)" class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeSelectedTermFromReview(term, i, 'HPO')">
                          {{ term.HPO_Data }}
                        </v-chip>
                        <v-chip v-else class="mr-2 mb-1" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'HPO')">
                          {{ term.HPO_Data }}
                        </v-chip>
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card-title>
              
              <v-card-text style="height: 450px;" id="termsReviewDialogContainer-target">


                <!-- Basic mode review terms table -->
                <div v-if="(extractedTermsObj.length || HpoReviewTerms.length) && termsReviewDialogPage===0">
                  <v-alert
                    border="left"
                    type="warning"
                    dense outlined dismissible
                    style="margin:20px"
                    v-if="showWarningOfMissedHpoTerms"
                  >
                    <span style="font-size: 12px">
                      Some of the inputted HPO terms are missing from terms provided. Please email at <a href="mailto:iobioproject@gmail.com">iobioproject@gmail.com</a> with your HPO terms and help us to fix it. 
                    </span>
                  </v-alert>

                  <div class="container">
                    <div class="row">
                      <div class="col-md-4">
                        <TermsModalHeading
                          heading="GTR Terms"
                          :selectedTerms="GtrTermsAdded_temp.length"
                          :potentialTerms="potentialGtrTermsCount">
                        </TermsModalHeading>
                        <div v-if="!extractedTermsObj.length">
                          <v-card-text>
                            <p style="margin-left: -15px;"><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                          </v-card-text>
                        </div>
                        
                        <div class="ml-7" style="margin-bottom: -20px">
                          <v-switch
                            v-model="gtrSelectSwitch"
                            label="Select all"
                            color="primary"
                          ></v-switch>
                        </div>
                        <div v-for="(term,i) in extractedTermsObj">
                          <div v-for="(item, ind) in term.reviewTerms_gtr">
                            <div v-if="ind===0" class="row">
                              <div class="col-md-1"></div>
                              <div class="col-md-1">
                                <div v-if="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(item.DiseaseName)">
                                  <v-checkbox color="primary" @click="removeSelectedTermFromReview(term, i, 'GTR')" style="margin-top:-6px; margin-bottom:-35px;" v-model="true_checkboxVal"></v-checkbox>
                                </div>
                                <div v-else>
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="GtrTermsAdded_temp" :value="item"></v-checkbox>
                                </div>
                              </div>
                              <div class="col-md-10">
                                {{ item.DiseaseName }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <TermsModalHeading
                          heading="Phenolyzer Terms"
                          :selectedTerms="phenolyzerTermsAdded_temp.length"
                          :potentialTerms="potentialPhenolyzerTermsCount">
                        </TermsModalHeading>
                        <div v-if="!extractedTermsObj.length">
                          <v-card-text>
                            <p style="margin-left: -15px;"><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                          </v-card-text>
                        </div>
                        
                        <div class="ml-7" style="margin-bottom: -20px">
                          <v-switch
                            v-model="phenolyzerSelectSwitch"
                            label="Select all"
                            color="primary"
                          ></v-switch>
                        </div>
                        <div v-for="(term,i) in extractedTermsObj">
                          <div v-for="(item, ind) in term.reviewTerms_phenolyzer">
                            <div v-if="ind===0" class="row">
                              <div class="col-md-1"></div>
                              <div class="col-md-1">
                                <div v-if="reReviewClinicalNote && note_reselect_phenolyzerTerms_Array.includes(item.value)">
                                  <v-checkbox color="primary" @click="removeSelectedTermFromReview(term, i, 'phenolyzer')" style="margin-top:-6px; margin-bottom:-35px;" v-model="true_checkboxVal"></v-checkbox>
                                </div>
                                <div v-else>
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="phenolyzerTermsAdded_temp" :value="item"></v-checkbox>
                                </div>
                              </div>
                              <div class="col-md-10">
                                {{ item.value | to-firstCharacterUppercase }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <br>

                      </div>
                      <div class="col-md-4">
                        <TermsModalHeading
                          heading="HPO Terms"
                          :selectedTerms="hpoTermsAdded_temp.length"
                          :potentialTerms="HpoReviewTerms.length">
                        </TermsModalHeading>
                        <div v-if="!HpoReviewTerms.length">
                          <v-card-text>
                            <p style="margin-left: -15px;"><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                          </v-card-text>
                        </div>

                        <div class="ml-7" style="margin-bottom: -20px">
                          <v-switch
                            v-model="hpoSelectSwitch"
                            label="Select all"
                            color="primary"
                          ></v-switch>
                        </div>
                        <div v-for="(term, i) in HpoReviewTerms" :key="i">
                          <div>
                            <div class="row">
                              <div class="col-md-1"></div>
                              <div class="col-md-1">
                                <div v-if="reReviewClinicalNote && note_reselect_hpoTerms_Array.includes(term.HPO_Data)">
                                  <v-checkbox color="primary" @click="removeSelectedTermFromReview(term, i, 'HPO')" style="margin-top:-6px; margin-bottom:-35px;" v-model="true_checkboxVal"></v-checkbox>
                                </div>
                                <div v-else>
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="hpoTermsAdded_temp" :value="term"></v-checkbox>
                                </div>
                              </div>
                              <div class="col-md-10">
                                <div style="margin-top:-5px">
                                  {{ term.phenotype }} <br> [{{ term.hpoNumber }}]
                                </div>
                                <!-- {{ term.HPO_Data }} -->
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  

                  
                  
                  <!-- <v-expansion-panels multiple popout focusable :readonly="readonly">
                    <v-expansion-panel v-for="(term, i) in extractedTermsObj" :key="i">
                      <v-expansion-panel-header expand-icon="none">
                        <div>
                          <div class="row">
                            <div class="col-md-1">
                              <div v-if="reReviewClinicalNote && note_reselect_basicModeTerms_Array.includes(term.DiseaseName)">
                                <v-checkbox color="primary" @click="removeSelectedTermFromReview(term, i, 'BasicMode')" style="margin-top:-6px; margin-bottom:-35px;" v-model="true_checkboxVal"></v-checkbox>
                              </div>
                              <div v-else>
                                <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="basicModeTermsAdded_temp" :value="term"></v-checkbox>
                              </div>
                            </div>
                            <div class="col-md-11 close-margin-left-20">
                              <strong> {{ term.DiseaseName }}</strong>
                            </div>
                          </div>
                        </div>
                      </v-expansion-panel-header>
                    </v-expansion-panel>
                  </v-expansion-panels> -->

                  <!-- Phenolyzer Terms: 
                  <div v-for="(term,i) in phenolyzerTermsAdded_temp">
                    <p>{{ term.value }}</p>
                  </div>
                  <br>
                  HPO Terms: 
                  <div v-for="(term,i) in hpoTermsAdded_temp">
                    <p>{{ term.HPO_Data }}</p>
                  </div>
                  <br> -->

                </div>
                <div v-if="!extractedTermsObj.length && !HpoReviewTerms.length && termsReviewDialogPage===0">
                  <v-card-text>
                    <p><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                  </v-card-text>
                </div>
                <!-- End basic mode review table. -->

                <!-- GTR review terms table -->
                <div v-if="GtrReviewTerms.length && termsReviewDialogPage===1">
                  <div v-if="GtrReviewTerms.length===1">
                    <div >
                      <v-expansion-panels v-model="gtr_terms_expansion_panel" multiple popout focusable>
                        <v-expansion-panel v-for="(item, i) in GtrReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_gtr.length && item.reviewTerms_gtr[0].general!==undefined && item.reviewTerms_gtr[0].general">
                              <div class="row">
                                <div class="col-md-9">
                                  <strong> {{ item.reviewTerms_gtr[0].DiseaseName}}</strong>
                                </div>
                                <!-- @click="toggle_expansion_panel(i, 'GTR')" is removed which was opening the respective expansion panel  -->
                                <div class="col-md-3"> 
                                  <span v-if="item.reviewTerms_gtr.length > 1"><small>{{item.reviewTerms_gtr.length}} options</small></span>
                                  <span v-if="item.reviewTerms_gtr.length === 1"><small>{{item.reviewTerms_gtr.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_gtr, 'GTR') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-9">
                                  <strong> {{ item.DiseaseName }} </strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_gtr.length > 1"><small>{{item.reviewTerms_gtr.length}} options</small></span>
                                  <span v-if="item.reviewTerms_gtr.length === 1"><small>{{item.reviewTerms_gtr.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_gtr, 'GTR') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
                              <v-card-text>
                                <div v-for="(sub, i) in item.reviewTerms_gtr" class="row">
                                  <div class="col-md-1">
                                    <div v-if="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(sub.DiseaseName)">
                                      <v-checkbox @click="removeSelectedTermFromReview(sub, i, 'GTR')" color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="true_checkboxVal"></v-checkbox>
                                    </div>
                                    <div v-else>
                                      <v-checkbox color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="GtrTermsAdded_temp" :value="sub"></v-checkbox>
                                    </div>
                                  </div>
                                  <div class="col-md-11 close-margin-left-40">
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
                      <!-- :readonly="readonly" is removed which was disabling the opening of expansion panel by clicking anywhere -->
                      <v-expansion-panels v-model="gtr_terms_expansion_panel" multiple popout focusable>
                        <v-expansion-panel v-for="(item, i) in GtrReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_gtr.length && item.reviewTerms_gtr[0].general!==undefined && item.reviewTerms_gtr[0].general">
                              <div class="row">
                                <!-- <div class="col-md-1">
                                  <div v-if="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(item.reviewTerms_gtr[0].DiseaseName)">
                                    <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" :disabled="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(item.reviewTerms_gtr[0].DiseaseName)"   v-model="true_checkboxVal"></v-checkbox>
                                  </div>
                                  <div v-else>
                                    <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" :disabled="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(item.reviewTerms_gtr[0].DiseaseName)"   v-model="GtrTermsAdded_temp" :value="item.reviewTerms_gtr[0]"></v-checkbox>
                                  </div>
                                </div> -->
                                <div class="col-md-9">
                                  <strong> {{ item.reviewTerms_gtr[0].DiseaseName}}</strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_gtr.length > 1"><small>{{item.reviewTerms_gtr.length}} options</small></span>
                                  <span v-if="item.reviewTerms_gtr.length === 1"><small>{{item.reviewTerms_gtr.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_gtr, 'GTR') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <!-- <div class="col-md-1">
                                </div> -->
                                <div class="col-md-9">
                                  <strong> {{ item.DiseaseName }} </strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_gtr.length > 1"><small>{{item.reviewTerms_gtr.length}} options</small></span>
                                  <span v-if="item.reviewTerms_gtr.length === 1"><small>{{item.reviewTerms_gtr.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_gtr, 'GTR') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
                              <v-card-text >
                                <div v-for="(sub, i) in item.reviewTerms_gtr" >
                                  <div class="row">
                                    <div class="col-md-1">

                                      <div v-if="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(sub.DiseaseName)">
                                        <!-- <v-checkbox color="primary" style="margin-top:-5px; margin-bottom:-12px;" :disabled="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(sub.DiseaseName)"   v-model="true_checkboxVal"></v-checkbox> -->
                                        <v-checkbox @click="removeSelectedTermFromReview(sub, i, 'GTR')" color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="true_checkboxVal"></v-checkbox>
                                      </div>
                                      <div v-else>
                                        <v-checkbox color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="GtrTermsAdded_temp" :value="sub"></v-checkbox>
                                      </div>

                                      <!-- <v-checkbox color="primary" style="margin-top:-5px; margin-bottom:-12px;" :disabled="reReviewClinicalNote && note_reselect_gtrTerms_Array.includes(sub.DiseaseName)" v-model="GtrTermsAdded_temp" :value="sub"></v-checkbox> -->
                                    </div>
                                    <div class="col-md-11 close-margin-left-40">
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
                  <v-card-text>
                    <p><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                  </v-card-text>
                </div>



                <!-- Phenolyzer review terms table -->
                <div v-if="phenolyzerReviewTerms.length && termsReviewDialogPage===2">
                  <div v-if="phenolyzerReviewTerms.length===1">
                    <div >
                      <v-expansion-panels v-model="phenolyzer_terms_expansion_panel" multiple popout focusable>
                        <v-expansion-panel v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_phenolyzer.length && item.reviewTerms_phenolyzer[0].general!==undefined && item.reviewTerms_phenolyzer[0].general">
                              <div class="row">
                                <div class="col-md-9">
                                  <strong> {{ item.reviewTerms_phenolyzer[0].value | to-firstCharacterUppercase}}</strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_phenolyzer.length > 1"><small>{{item.reviewTerms_phenolyzer.length}} options</small></span>
                                  <span v-if="item.reviewTerms_phenolyzer.length === 1"><small>{{item.reviewTerms_phenolyzer.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_phenolyzer, 'Phenolyzer') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-9">
                                  <strong> {{ item.reviewTerms_phenolyzer[0].value | to-firstCharacterUppercase }} </strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_phenolyzer.length > 1"><small>{{item.reviewTerms_phenolyzer.length}} options</small></span>
                                  <span v-if="item.reviewTerms_phenolyzer.length === 1"><small>{{item.reviewTerms_phenolyzer.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_phenolyzer, 'Phenolyzer') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
                              <v-card-text >
                                <div v-for="(sub, i) in item.reviewTerms_phenolyzer" >
                                  <div class="row">
                                    <!-- shows checkbox -->
                                    <div class="col-md-1"> 
                                      <div v-if="reReviewClinicalNote && note_reselect_phenolyzerTerms_Array.includes(sub.value)">
                                        <v-checkbox @click="removeSelectedTermFromReview(sub, i, 'phenolyzer')" color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="true_checkboxVal"></v-checkbox>
                                      </div>
                                      <div v-else>
                                        <v-checkbox color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="phenolyzerTermsAdded_temp" :value="sub"></v-checkbox>
                                      </div>
                                      <!-- end show checkbox -->
                                    </div>
                                    <!-- show options -->
                                    <div class="col-md-11 close-margin-left-40">
                                      <span v-if="sub.general">
                                        <span class="highlighted_condition">{{ sub.value | to-firstCharacterUppercase }}</span>
                                      </span>
                                      <span v-else>{{ sub.value | to-firstCharacterUppercase }}</span>
                                    </div>
                                    <!-- end show options -->
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
                      <v-expansion-panels v-model="phenolyzer_terms_expansion_panel" multiple popout focusable>
                        <v-expansion-panel v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_phenolyzer.length && item.reviewTerms_phenolyzer[0].general!==undefined && item.reviewTerms_phenolyzer[0].general">
                              <div class="row">
                                <div class="col-md-9">
                                  <strong> {{ item.reviewTerms_phenolyzer[0].value | to-firstCharacterUppercase}}</strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_phenolyzer.length > 1"><small>{{item.reviewTerms_phenolyzer.length}} options</small></span>
                                  <span v-if="item.reviewTerms_phenolyzer.length === 1"><small>{{item.reviewTerms_phenolyzer.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_phenolyzer, 'Phenolyzer') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-9">
                                  <strong> {{ item.reviewTerms_phenolyzer[0].value | to-firstCharacterUppercase }} </strong>
                                </div>
                                <div class="col-md-3">
                                  <span v-if="item.reviewTerms_phenolyzer.length > 1"><small>{{item.reviewTerms_phenolyzer.length}} options</small></span>
                                  <span v-if="item.reviewTerms_phenolyzer.length === 1"><small>{{item.reviewTerms_phenolyzer.length}} option</small></span>
                                  <span class="primary--text ml-1"> <small>({{ getSelectedCount(item.reviewTerms_phenolyzer, 'Phenolyzer') }} selected)</small>  </span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
                              <v-card-text >
                                <div v-for="(sub, i) in item.reviewTerms_phenolyzer" >
                                  <div class="row">
                                    <div class="col-md-1">
                                      <!-- shows checkbox -->
                                      <div v-if="reReviewClinicalNote && note_reselect_phenolyzerTerms_Array.includes(sub.value)">
                                        <v-checkbox @click="removeSelectedTermFromReview(sub, i, 'phenolyzer')" color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="true_checkboxVal"></v-checkbox>
                                      </div>
                                      <div v-else>
                                        <v-checkbox color="primary" style="margin-top:-5px; margin-bottom:-12px;" v-model="phenolyzerTermsAdded_temp" :value="sub"></v-checkbox>
                                      </div>
                                      <!-- end show checkbox -->
                                    </div>
                                    <!-- show options -->
                                    <div class="col-md-11 close-margin-left-40">
                                      <span v-if="sub.general">
                                        <span class="highlighted_condition">{{ sub.value | to-firstCharacterUppercase }}</span>
                                      </span>
                                      <span v-else>{{ sub.value | to-firstCharacterUppercase }}</span>
                                    </div>
                                    <!-- end show options -->
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
                  <v-card-text>
                    <p><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                  </v-card-text>
                </div>


                <!-- HPO review terms table -->
                <div v-if="HpoReviewTerms.length && termsReviewDialogPage===3">
                  <v-expansion-panels multiple popout focusable :readonly="readonly">
                    <v-expansion-panel v-for="(term, i) in HpoReviewTerms" :key="i">
                      <v-expansion-panel-header expand-icon="none">
                        <div>
                          <div class="row">
                            <div class="col-md-1">

                              <div v-if="reReviewClinicalNote && note_reselect_hpoTerms_Array.includes(term.HPO_Data)">
                                <v-checkbox color="primary" @click="removeSelectedTermFromReview(term, i, 'HPO')" style="margin-top:-6px; margin-bottom:-35px;" v-model="true_checkboxVal"></v-checkbox>
                              </div>
                              <div v-else>
                                <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="hpoTermsAdded_temp" :value="term"></v-checkbox>
                              </div>

                              <!-- <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="hpoTermsAdded_temp" :value="term"></v-checkbox> -->
                            </div>
                            <div class="col-md-11 close-margin-left-20">
                              <strong> {{ term.HPO_Data }}</strong>
                            </div>
                          </div>
                        </div>
                      </v-expansion-panel-header>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
                <div v-if="!HpoReviewTerms.length && termsReviewDialogPage===3">
                  <div v-if="HpoloadingProgressBar">
                    <v-card-text>
                        <p>Fetching the HPO terms...</p>
                      <v-progress-linear
                        indeterminate
                        color="primary"
                        class="mb-0"
                        height="8"
                      ></v-progress-linear>
                    </v-card-text>
                  </div>
                  <div v-else>
                    <v-card-text>
                      <p><v-icon>error_outline</v-icon> No matching terms from this resource</p>
                    </v-card-text>
                  </div>
                </div>


                <!-- All terms review page -->
                <div v-if="termsReviewDialogPage===4">
                  <v-card>
                    <v-card-text>
                      <div class="container">
                        <div class="row">
                          <!-- GTR -->
                          <div class="col-md-4">
                            <table class="table">
                              <thead>
                                <tr>
                                  <strong>GTR Terms</strong>
                                  <span style="float: right">
                                    <v-btn @click="openTermsReviewDialogPage(1)" text small color="primary">edit</v-btn>
                                  </span>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                                  <td class="i-text--left i-terms-spacing" @mouseover="mouseOverGtrTerm_review(term.DiseaseName)" @mouseleave="hovered_gtr_term_review=''">
                                    <div>
                                      <span> {{ term.DiseaseName }} </span>
                                    </div>
                                  </td>
                                  <td class="i-icon--spacing" @mouseover="mouseOverGtrTerm_review(term.DiseaseName)" @mouseleave="hovered_gtr_term_review=''">
                                    <span v-if="hovered_gtr_term_review===term.DiseaseName && !note_reselect_gtrTerms_Array.includes(term.DiseaseName)">
                                      <v-icon class="terms_delete_btn" @click="removeReviewTerms(term, i, 'GTR')">delete</v-icon>
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div v-if="GtrTermsAdded_temp.length<1">
                              <span><i>Not Selected...</i></span>
                            </div>
                          </div>

                          <!-- Phenolyzer -->
                          <div class="col-md-4">
                            <table class="table">
                              <thead>
                                <tr>
                                  <strong>Phenolyzer Terms</strong>
                                  <span style="float: right">
                                    <v-btn @click="openTermsReviewDialogPage(2)" text small color="primary">edit</v-btn>
                                  </span>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                                  <td class="i-terms-spacing" @mouseover="mouseOverPhenolyzerTerm_review(term.value)" @mouseleave="hovered_phenolyzer_term_review=''">
                                    <div >
                                      <span>{{ term.value }} </span>
                                    </div>
                                  </td>
                                  <td class="i-icon--spacing" @mouseover="mouseOverPhenolyzerTerm_review(term.value)" @mouseleave="hovered_phenolyzer_term_review=''">
                                    <span v-if="hovered_phenolyzer_term_review===term.value && !note_reselect_phenolyzerTerms_Array.includes(term.value)">
                                      <v-icon class="terms_delete_btn" @click="removeReviewTerms(term, i, 'phenolyzer')">delete</v-icon></span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div v-if="phenolyzerTermsAdded_temp.length<1">
                              <span><i>Not Selected...</i></span>
                            </div>
                          </div>

                          <div class="col-md-4">
                            <table class="table">
                              <thead>
                                <tr>
                                  <strong>HPO Terms</strong>
                                  <span style="float: right">
                                    <v-btn @click="openTermsReviewDialogPage(3)" text small color="primary">edit</v-btn>
                                  </span>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                                  <td class="i-terms-spacing" @mouseover="mouseOverHpoTerm_review(term.HPO_Data)" @mouseleave="hovered_hpo_term_review=''">
                                    <div>
                                      <span>{{ term.HPO_Data }} </span>
                                    </div>
                                  </td>
                                  <td class="i-icon--spacing" @mouseover="mouseOverHpoTerm_review(term.HPO_Data)" @mouseleave="hovered_hpo_term_review=''">
                                    <span v-if="hovered_hpo_term_review===term.HPO_Data && !note_reselect_hpoTerms_Array.includes(term.HPO_Data)">
                                      <v-icon class="terms_delete_btn" @click="removeReviewTerms(term, i, 'HPO')">delete</v-icon>
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div v-if="hpoTermsAdded_temp.length<1">
                              <span><i>Not Selected...</i></span>
                            </div>
                          </div>


                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>


              </v-card-text>
              <v-card-actions class="mb-3 ml-5 mr-5 mt-3">
                <div></div> 
                <!-- use class flex-grow-1 for centering  -->
                <v-btn v-if="termsReviewDialogPage===0" @click="navigateTermsReviewDialog('next', 'termsReviewDialogContainer-target')" small style="letter-spacing:0.03em" color="primary" text>
                  Refine selected terms
                  <v-icon small class="ml-1">info</v-icon>
                </v-btn>
                <!-- <v-btn small color="blue darken-1" round outlined dark text @click="termsReviewDialog=false">Skip</v-btn> -->
                <v-spacer></v-spacer>
                <!-- <v-btn :disabled="termsReviewDialogPage!==4" small color="primary" @click="selectReviewTerms">Done</v-btn> -->
                <div v-if="editReviewSelectedTerms">
                  <v-btn small color="primary" outlined @click="clearEditMode('cancel')" tile> Cancel</v-btn>
                  <v-btn small color="primary" @click="clearEditMode('save')" tile> Save </v-btn>
                </div>
                <div v-else-if="!editReviewSelectedTerms">
                  <!-- <v-btn :disabled="termsReviewDialogPage===1" small color="primary" @click="navigateTermsReviewDialog('back', '#termsReviewDialogContainer-target')"><v-icon>arrow_left</v-icon> Back</v-btn> -->
                  <v-btn v-if="termsReviewDialogPage!==0" :disabled="termsReviewDialogPage===0" small color="primary" outlined @click="navigateTermsReviewDialog('back', '#termsReviewDialogContainer-target')" tile><v-icon>arrow_left</v-icon> Back</v-btn>

                  <!-- <v-btn v-if="termsReviewDialogPage===0" small color="#ffaf4d" style="color:white" @click="navigateTermsReviewDialog('next', 'termsReviewDialogContainer-target')"><v-icon class="mr-1">filter_list</v-icon>  <strong>Refine terms</strong> </v-btn> -->
                  <!-- <v-btn v-if="termsReviewDialogPage===0" small color="primary" @click="navigateTermsReviewDialog('review', 'termsReviewDialogContainer-target')"> Review <v-icon>arrow_right</v-icon></v-btn> -->

                  <v-btn v-if="termsReviewDialogPage!==4 && termsReviewDialogPage!==0" tile :disabled="termsReviewDialogPage>3" small color="primary" @click="navigateTermsReviewDialog('next', 'termsReviewDialogContainer-target')"> Next <v-icon>arrow_right</v-icon></v-btn>
                  <v-btn v-if="termsReviewDialogPage===4" small tile color="primary" @click="selectReviewTerms"> Next <v-icon>arrow_right</v-icon></v-btn>
                  <v-btn v-if="termsReviewDialogPage===0" small tile outlined color="primary" @click="termsReviewDialog=false"> Cancel</v-btn>
                  <v-btn v-if="termsReviewDialogPage===0" small tile color="primary" @click="selectReviewTerms"> Generate gene list</v-btn>

                </div>

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
            max-width="1150px"
            transition="dialog-transition"
          >
            <v-card>
              <v-card-title class="grey lighten-2">
                <v-icon class="mr-2" color="primary darken-1">youtube_searched_for</v-icon> Generating Gene List
                <v-spacer></v-spacer>
                <span>
                  <v-btn text icon @click="searchStatusDialog=false"><v-icon>close</v-icon></v-btn>
                </span>
              </v-card-title>
              <!-- <v-divider></v-divider> -->
              <v-card-text>
                <div class="container">
                  <v-alert
                    border="left"
                    type="success"
                    dense
                    style="margin:20px"
                    v-if="searchStatusCompleteAlert"
                  >
                  <span style="font-size: 12px">
                    Everything is loaded. You can now close this modal.
                  </span>
                  </v-alert>
                  
                  <div class="row">
                    
                    <!-- Start GTR search status -->
                    <div class="col-md-4">
                      <div class="mb-7 text-center" style="margin-right: 125px">
                        <strong class="primary--text" style="font-size: 18px">GTR Terms</strong>
                        <br>
                        <div class="mt-2 mb-5">
                          <span><h1 style="display:inline"> {{ Gtr_searchTermsObj.length }}</h1> </span> <span>terms selected</span>
                        </div>
                      </div>
                      <div v-if="Gtr_searchTermsObj.length" v-for="(term, i) in Gtr_searchTermsObj" :key="i">
                        <div class="row" style="margin-bottom: -8px; margin-top: -8px">
                          <div class="col-md-1"></div>
                          <div class="col-md-1">
                            <span v-if="term.gtrSearchStatus==='Searching'">
                              <v-progress-circular
                                :width="2"
                                :size="20"
                                indeterminate
                                color="primary"
                              ></v-progress-circular>
                            </span>
                            <span v-else-if="term.gtrSearchStatus==='Completed'">
                              <v-icon color="green" style="font-weight: bolder">done</v-icon>
                            </span>
                            <span v-else-if="term.gtrSearchStatus==='NoGenes'">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                  <v-icon color="grey" style="font-size:20px" v-on="on">block</v-icon>
                                </template>
                                <span>No genes were found for this term</span>
                              </v-tooltip>
                            </span>
                            <span v-else-if="term.gtrSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                            <span v-else>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                  <v-icon color="gray lighten-4" v-on="on">error</v-icon>
                                </template>
                                <span>The network request for this term failed. Please delete this term and try again.</span>
                              </v-tooltip>
                            </span>
                          </div>
                          <div class="col-md-10">
                            {{ term.DiseaseName }}
                          </div>
                        </div>

                      </div>
                      <div v-if="Gtr_searchTermsObj.length<1">
                        <p style="margin-left: 20px;">
                          <div style="margin-left: -25px">
                            <MissingTermsIcon :tab="tab_idx">
                            </MissingTermsIcon>
                          </div>
                          <p  style="margin-left: 30px;">
                            <v-icon>error_outline</v-icon> No terms were selected
                          </p>
                        </p>
                      </div>
                    </div>
                    <!-- End GTR search status -->


                    <!-- Start Phenolyzer search status -->
                    <div class="col-md-4">                      
                      <div class="mb-7 text-center" style="margin-right: 125px">
                        <strong class="primary--text" style="font-size: 18px">Phenolyzer Terms</strong>
                        <br>
                        <div class="mt-2 mb-5">
                          <span><h1 style="display:inline"> {{ Phenolyzer_searchTermsObj.length }}</h1> </span> <span>terms selected</span>
                        </div>
                      </div>
                      <div v-if="Phenolyzer_searchTermsObj.length" v-for="(term, i) in Phenolyzer_searchTermsObj" :key="i">
                        <div class="row" style="margin-bottom: -8px; margin-top: -8px">
                          <div class="col-md-1">
                            <span v-if="term.phenolyzerSearchStatus==='running'">
                              <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                  <span @click="stopPhenolyzerSearch(term.value)">
                                    <v-icon small color="grey" style="font-size:18px; cursor: pointer" v-on="on">cancel</v-icon>
                                  </span>
                                </template>
                                <span>Cancel search for this term</span>
                              </v-tooltip>
                            </span>
                          </div>
                          <div class="col-md-1">
                            <span v-if="term.phenolyzerSearchStatus==='Searching'">
                              <v-progress-circular
                                :width="2"
                                :size="20"
                                indeterminate
                                color="primary"
                              ></v-progress-circular>
                            </span>
                            <span v-else-if="term.phenolyzerSearchStatus==='running'">
                              <span>
                                <v-progress-circular
                                  :width="2"
                                  :size="20"
                                  indeterminate
                                  color="primary"
                                ></v-progress-circular>
                              </span>
                            </span>
                            <span v-else-if="term.phenolyzerSearchStatus==='Completed'">
                              <v-icon color="green" style="font-weight: bolder">done</v-icon>
                            </span>
                            <span v-else-if="term.phenolyzerSearchStatus==='NoGenes'">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                  <v-icon color="grey" style="font-size:20px" v-on="on">block</v-icon>
                                </template>
                                <span>No genes were found for this phenotype</span>
                              </v-tooltip>
                            </span>
                            <span v-else-if="term.phenolyzerSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                            <span v-else-if="term.phenolyzerSearchStatus==='Cancelled'">
                              <v-icon color="gray lighten-4">error_outline</v-icon>
                            </span>
                            <span v-else>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                  <v-icon color="gray lighten-4" v-on="on">error</v-icon>
                                </template>
                                <span>The network request for this term failed. Please delete this term and try again.</span>
                              </v-tooltip>
                            </span>
                          </div>
                          <div class="col-md-10">
                            {{ term.value }}
                          </div>
                        </div>

                      </div>
                      <div v-if="Phenolyzer_searchTermsObj.length<1">
                        <p style="margin-left: 20px;">
                          <div style="margin-left: -25px">
                            <MissingTermsIcon :tab="tab_idx">
                            </MissingTermsIcon>
                          </div>
                          <p  style="margin-left: 30px;">
                            <v-icon>error_outline</v-icon> No terms were selected
                          </p>
                        </p>
                      </div>
                    </div>
                    <!-- End Phenolyzer search status -->


                    <!-- Start HPO search status -->
                    <div class="col-md-4">
                      <div class="mb-7 text-center" style="margin-right: 125px">
                        <strong class="primary--text" style="font-size: 18px">HPO Terms</strong>
                        <br>
                        <div class="mt-2 mb-5">
                          <span><h1 style="display:inline"> {{ Hpo_searchTermsObj.length }}</h1> </span> <span>terms selected</span>
                        </div>
                      </div>
                      <div v-if="Hpo_searchTermsObj.length" v-for="(term, i) in Hpo_searchTermsObj" :key="i">
                        <div class="row" style="margin-bottom: -8px; margin-top: -8px">
                          <div class="col-md-1"></div>
                          <div class="col-md-1">
                            <span v-if="term.hpoSearchStatus==='Searching'">
                              <v-progress-circular
                                :width="2"
                                :size="20"
                                indeterminate
                                color="primary"
                              ></v-progress-circular>
                            </span>
                            <span v-else-if="term.hpoSearchStatus==='Completed'"><v-icon color="green" style="font-weight: bolder">done</v-icon></span>
                            <span v-else-if="term.hpoSearchStatus==='NoGenes'">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                  <v-icon color="grey" style="font-size:20px" v-on="on">block</v-icon>
                                </template>
                                <span>No genes were found for this term</span>
                              </v-tooltip>
                            </span>
                            <span v-else-if="term.hpoSearchStatus==='NotAvailable'"><v-icon>indeterminate_check_box</v-icon></span>
                            <span v-else>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                  <v-icon color="gray lighten-4" v-on="on">error</v-icon>
                                </template>
                                <span>The network request for this term failed. Please delete this term and try again.</span>
                              </v-tooltip>
                            </span>
                          </div>
                          <div class="col-md-10">
                            {{ term.phenotype }} <br> [{{ term.hpoNumber }}]
                          </div>
                        </div>
                      </div>
                      <div v-if="Hpo_searchTermsObj.length<1">
                        <p style="margin-left: 20px;">
                          <div style="margin-left: -25px">
                            <MissingTermsIcon tab="0">
                            </MissingTermsIcon>
                          </div>
                          <p  style="margin-left: 30px;">
                            <v-icon>error_outline</v-icon> No terms were selected
                          </p>
                        </p>
                      </div>
                    </div>
                    <!-- End HPO search status -->

                  </div> <!-- End row -->
                </div><!-- End container -->
              </v-card-text>
              <v-card-actions class="mb-3 ml-5 mr-5 mt-3">
                <v-spacer></v-spacer>
                <v-btn :disabled="!searchStatusCompleteAlert" @click="closeSearchStatusDialog"  small color="primary" tile> Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
        <!-- End search status dialog -->
        
        <!-- Modal to confirm phenotype deletion  -->
        <v-dialog v-model="removePhenotypeDialog" max-width="650">
          <v-card>
            <v-card-title class="headline"></v-card-title>
            <v-card-text>
              <span v-html="deletePhenotypeConfirmationText"></span>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="remove(toDeletePhenotype.item, toDeletePhenotype.idx, toDeletePhenotype.component)">Yes</v-btn>
              <v-btn color="primary" text @click="cancelRemovePhenotype">No</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!--End Modal to confirm phenotype deletion -->
        
        <!-- Modal to confirm Input note deletion  -->
        <v-dialog persistent v-model="removeNoteConfirmationDialog" max-width="650">
          <v-card>
            <v-card-title >                
              Are you sure you want to delete the following note? 
            </v-card-title>
            <v-card-text>
              <hr style="margin-top: 0; margin-bottom:10px">
              <p class="mt-2 pt-2 pb-2">
                <span class="mt-2 pt-2 pb-2" style="font-size: 14px;">
                  {{ noteToDelete.note | to-firstCharacterUppercase }}
                </span>
              </p>
              <v-alert
                border="left"
                type="warning"
                dense
                v-if="searchStatusCompleteAlert"
                outlined
              >
              <span style="font-size: 12px">
                Deleting this note will remove all the selected terms and genes associated with it. 
              </span>
              </v-alert>

            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" small tile @click="deleteInputNote(noteToDelete.note, noteToDelete.idx)">Yes</v-btn>
              <v-btn color="primary" small outlined tile @click="cancelDeleteInputNote">No</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!--End Modal to confirm Input note deletion -->


        <!-- Deleting note dialog box -->
          <v-dialog
            v-model="deletingNoteDialog"
            hide-overlay
            width="300"
            persisitent
          >
            <v-card
              color="primary"
              dark
            >
              <v-card-text>
                  <p style="color:white">Reorganizing gene list...</p>
                <v-progress-linear
                  indeterminate
                  color="white"
                  class="mb-0"
                ></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-dialog>
          <!-- End Deleting note dialog box -->



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
          v-bind:HpoSearchTermCount="Hpo_searchTermsObj.length"
          @hpoIndividualGenes="hpoIndividualGenes($event)"
          @HpoFullGeneList="HpoFullGeneList($event)"
          @individualGenesObjHpo="individualGenesObjHpo($event)">
        </HpoSearch>

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
          :VennDiagramData="VennDiagramData"
          @emit_venn_data="emit_venn_data($event)"
          @venn_diag_summaryObj="venn_diag_summaryObj($event)"
          :geneToDelete="geneToDelete">
        </SummaryTab>
        

    <!-- </v-layout> -->
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
import SkeletonLoadersSearchTerms from './SkeletonLoadersSearchTerms.vue';
import VennDiagram from './VennDiagram.vue'
import Model from '../models/Model';
import TermsModalHeading from '../partials/TermsModalHeading.vue'
var model = new Model();
import * as d3 from "d3";

import MissingNoteIcon from '../partials/MissingNoteIcon.vue';
import MissingTermsIcon from '../partials/MissingTermsIcon.vue'
import MissingNoteVizIcon from '../partials/MissingNoteVizIcon.vue'

export default {
  name: 'PhenotypeExtractor',
  components: {
    GtrSearch,
    SummaryTab,
    PhenolyzerSearch,
    HpoSearch,
    SkeletonLoadersSearchTerms,
    VennDiagram,
    TermsModalHeading,
    MissingTermsIcon,
    MissingNoteIcon,
    MissingNoteVizIcon,
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
    },
    AddedGenes: {
      type: Array
    },
    demoTextNote: {
      type: String
    }, 
    geneToDelete: {
      type: String
    },
    textNotesLandingPage: null,
  },
  data: () => ({
    search: '',
    multipleSearchTerms: [],
    searchTermsObj: [],
    idx: 0,
    gtrFetchCompleted: true,
    phenolyzerFetchCompleted: true,
    hpoFetchCompleted: true,
    searchTermsObjHeaders: [
      {text: 'Search Term', sortable: false, value: 'DiseaseName'},
      {text: 'GTR Search Status', sortable: false, value: 'gtrSearchStatus'},
      {text: 'Phenolyzer Search Status', sortable: false, value: 'phenolyzerSearchStatus'},
      {text: 'HPO Search Status', sortable: false, value: 'hpoSearchStatus'},
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
    hpoLookupUrl:  "https://backend.iobio.io/hpo/hot/lookup/?term=",
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
    basicModeTermsAdded: [],
    extractedTerms: [],
    extractedTermsObj: [],
    Gtr_searchTermsObj: [],
    Phenolyzer_searchTermsObj: [],
    Hpo_searchTermsObj: [],
    Gtr_idx: 0, //increment when event emitted for search
    Phenolyzer_idx: 0,
    Hpo_idx: 0,
    searchStatusDialog: false,
    searchStatusCompleteAlert: false,
    gtrExpansionPanel: ['true'],
    gtrExpansionPanelMultiple: [],
    phenolyzerExpansionPanel: ['true'],
    phenolyzerExpansionPanelMultiple: [],
    GtrTermsAdded_temp: [],
    phenolyzerTermsAdded_temp: [],
    hpoTermsAdded_temp: [],
    basicModeTermsAdded_temp: [],
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
    associatedGenesIndividualObject: {}, 
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
    BasicMode_SearchTermArray: [],
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
    DuplicateSearchStatusDialog: false,
    showSearchTermsLoader: false,
    searchterms_expansion_panel: [0],
    readonly: true,
    gtr_terms_expansion_panel: [],
    phenolyzer_terms_expansion_panel: [],
    expansion_hint_alert: true,
    loading: true,
    transition: 'scale-transition',
    venn_diagram_data: null,
    clinical_note_text: [],
    clinical_note_text_expansion_panel: [0],
    hovered_gtr_term: '',
    hovered_phenolyzer_term: '',
    hovered_hpo_term: '',
    search_status_expansion_panel: [0],
    genesOverlap: false,
    hovered_gtr_term_review: '',
    hovered_phenolyzer_term_review: '',
    hovered_hpo_term_review: '',
    reReviewClinicalNote: false,
    note_reselect_gtrTerms_Array: [],
    note_reselect_phenolyzerTerms_Array: [],
    note_reselect_hpoTerms_Array: [],
    note_reselect_basicModeTerms_Array: [],
    note_rereview_idx: null,
    true_checkboxVal: true,
    disabledItems_alert: true,
    HpoloadingProgressBar: false,
    removePhenotypeDialog: false, 
    deletePhenotypeConfirmationText: '', 
    toDeletePhenotype: {},
    searchStatusDialogTimeoutCheck: null,  
    editReviewSelectedTerms: false, 
    GtrTermsAdded_temp_editMode: [], 
    phenolyzerTermsAdded_temp_editMode: [],
    hpoTermsAdded_temp_editMode: [],
    countGeneListUpdated: 0, 
    showInfoThatStepIsComplete: false, 
    showGeneListReadySnackbar: false,
    basicTermsSelectionMode: true,
    hpoIds: [],
    potentialGtrTermsCount: 0,
    potentialPhenolyzerTermsCount: 0,
    phenolyzerTermsReturned: [],
    removeNoteConfirmationDialog: false,
    noteToDelete: {},
    deletingNoteDialog: false,
    hpoTermsDetected: false,
    hpo_radios: "inputted_hpo_only",
    hpoExtractedIds: [],
    showWarningOfMissedHpoTerms: false,
    hpoGenesCountForBarChart: [],
    tab_idx: 0,
    gtrSelectSwitch: true,
    phenolyzerSelectSwitch: true,
    hpoSelectSwitch: true,
    scaledHpoScores: [],
    x: null,
  }),
  watch: {
    gtrSelectSwitch(){
      if(this.gtrSelectSwitch){
        this.GtrTermsAdded_temp = [];
        this.extractedTermsObj.map(term => {
          term.reviewTerms_gtr.map((item, ind) => {
            if (ind === 0) {
              this.GtrTermsAdded_temp.push(item);
            }
          })
        })
      }
      else if (!this.gtrSelectSwitch) {
        this.GtrTermsAdded_temp = [];
      }
    },
    phenolyzerSelectSwitch() {
      if(this.phenolyzerSelectSwitch){
        this.phenolyzerTermsAdded_temp = [];
        this.extractedTermsObj.map(term => {
          term.reviewTerms_phenolyzer.map((item, ind) => {
            if (ind === 0) {
              this.phenolyzerTermsAdded_temp.push(item);
            }
          })
        })
      }
      else if (!this.phenolyzerSelectSwitch) {
        this.phenolyzerTermsAdded_temp = [];
      }
    },
    hpoSelectSwitch(){
      if(this.hpoSelectSwitch){
        this.hpoTermsAdded_temp = [];
        this.HpoReviewTerms.map(term => {
          this.hpoTermsAdded_temp.push(term);
        })
      }
      else if (!this.hpoSelectSwitch) {
        this.hpoTermsAdded_temp = [];
      }
    },
    tab_idx(){
      if(this.tab_idx == 1){
        bus.$emit("selected-tab", "HPO")
      }
      else if(this.tab_idx == 0){
        bus.$emit("selected-tab", "Input")
      }
    },
    hpo_radios(){
      this.setTermsSelectedFromBasicModeForReview();
    }, 
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
    AddedGenes(){
      // console.log("AddedGenes", this.AddedGenes);
      this.manuallyAddedGenes = this.AddedGenes;
      this.addDiseases(this.filteredDiseasesItemsArray);
      this.sendPhenolyzerGenesToSummary(this.phenolyzerItems);
      this.sendHpoGenesToSummary(this.hpoItems);
    },
    searchStatusDialog(){
      if(this.searchStatusDialog){
        this.showSearchTermsLoader = true;
        bus.$emit("show-gene-table-skeleton-loaders");
      }
      else {
        this.showSearchTermsLoader = false;
        bus.$emit("hide-gene-table-skeleton-loaders")
      }
    },
    GtrTermsAdded_temp(){
    },
    basicModeTermsAdded_temp(){
    },
    textNotesLandingPage(){
      if(this.textNotesLandingPage.length) {
        this.textNotes = this.textNotesLandingPage
        this.extract();
      }
    },
    GtrReviewTerms(){
    }

  },

  created(){
    this.venn_diagram_data = this.VennDiagramData;
  },

  mounted(){
    // this.drawHistogram()
    this.textNotes =this.demoTextNote;
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
    
    bus.$on("failedPhenolyzerFetchRequest", searchTerm => {
      var idx = this.Phenolyzer_searchTermArray.indexOf(searchTerm);
      this.$set(this.Phenolyzer_searchTermsObj[idx], 'phenolyzerSearchStatus', "failed");
      this.Phenolyzer_search_complete_idx = this.Phenolyzer_search_complete_idx+1;
      if(this.Phenolyzer_search_complete_idx === this.Phenolyzer_searchTermArray.length){
        this.phenolyzerFetchCompleted = true;
        if(!this.phenolyzerSavedState){
          this.checkToCloseSearchStatusDialog();
        }
      }
    })

    bus.$on("failedGtrFetchRequest", searchTerm => {
      var idx = this.Gtr_searchTermArray.indexOf(searchTerm);
      this.$set(this.Gtr_searchTermsObj[idx], 'gtrSearchStatus', "failed");
      this.Gtr_search_complete_idx = this.Gtr_search_complete_idx+1;
      if(this.Gtr_search_complete_idx === this.Gtr_searchTermArray.length){
        this.gtrFetchCompleted = true;
        if(!this.gtrSavedState){
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

    bus.$on("removePhenotype", (details) => {
      let { term, idx, component } = details;
      this.remove(term, idx, component)
    })

    bus.$on("closeVennDiagramPanel", ()=>{
      this.toggle_gene_overlap_button();
    })

    //Check if there is saved state
    if(this.phenotypes.length){
      this.has_saved_state = true;
      this.showSearchTermsLoader = true;
      bus.$emit("show-gene-table-skeleton-loaders");

      if(this.phenotypes[0].length){
        var time_to_show_skeleton_loader = this.phenotypes[0].length * 4500;
        setTimeout(()=>{
          bus.$emit("hide-gene-table-skeleton-loaders")
        }, time_to_show_skeleton_loader)

        var time_to_show_chips_loaders = this.phenotypes[0].length * 4500;
        setTimeout(()=>{
          this.showSearchTermsLoader = false;
        }, time_to_show_chips_loaders)
      }
      else {
        setTimeout(()=>{
          this.showSearchTermsLoader = false;
          bus.$emit("hide-gene-table-skeleton-loaders")
        }, 2500)
      }
    }

    if(this.phenotypes.length && this.phenotypes[0].length){
      this.gtrSavedState= true;
      this.gtrSavedTermsLength = this.phenotypes[0].length;
      this.GtrTermsAdded = this.phenotypes[0];
      this.GtrTermsAdded.map(term => {
        this.gtr_push_idx = this.gtr_push_idx + 1;
        this.Gtr_searchTermsObj.push(term);
        this.Gtr_searchTermArray.push(term.DiseaseName);
        this.multipleSearchTerms.push(term.DiseaseName)
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
        this.multipleSearchTerms.push(term.value);
      })
      this.Phenolyzer_performSearchEvent_saved()
    }

    if(this.phenotypes.length && this.phenotypes[2].length){
      this.hpoSavedState= true;
      this.hpoSavedTermsLength = this.phenotypes[2].length;
      this.hpoTermsAdded = this.phenotypes[2];
      this.hpoTermsAdded.map(term => {
        this.Hpo_searchTermsObj.push(term);
        this.Hpo_searchTermArray.push(term.hpoNumber);
        this.multipleSearchTerms.push(term.HPO_Data);
      })
      this.Hpo_performSearchEvent_saved()
    }

    if(this.phenotypes.length && this.phenotypes[3].length){
      this.clinical_note_text = this.phenotypes[3];
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
    getSelectedCount: function(terms, type) {
      var count = 0; 
      if(type==='GTR'){
        terms.map( term => {
          this.GtrTermsAdded_temp.map(temp => {
            if(term.DiseaseName === temp.DiseaseName) {
              count = count + 1;
            }
          })
        })
      }
      else {
        terms.map( term => {
          this.phenolyzerTermsAdded_temp.map(temp => {
            if(term.value === temp.value) {
              count = count + 1;
            }
          })
        })
      }
      return count;
    },
    
    calculateHpoScaledScore(genes){
      var scoresArr = [];
      this.scaledHpoScores = [];
      genes.map(gene => {
        scoresArr.push(gene.specificityScore)
      })
      this.maxScore = Math.max(...scoresArr);
      scoresArr.map(x => {
        var scaledScore = x/this.maxScore;
        if (this.maxScore == x) {
          scaledScore = 0.9999;
        }
        this.scaledHpoScores.push(scaledScore.toFixed(4))
      })
      this.drawHistogram()
    },
    
    calculateScaledScore(specificityScore){
      var scaledScore =  specificityScore/this.maxScore;
      return scaledScore.toFixed(4)
    },

    summaryGenesFullList(genes){
      // this.$emit('summaryGenes', genes);
      this.summaryAllGenes = genes;
      this.calculateHpoScaledScore(genes);
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
            geneRankPhenolyzer: gene.geneRankPhenolyzer,
            isImportedGenes: gene.isImportedGenes,
            isAssociatedGene: gene.isAssociatedGene,
            specificityScore: gene.specificityScore,
            scaledScore: this.calculateScaledScore(gene.specificityScore)
          }
        })
        this.$emit('summaryGenes', clinData);
        // console.log("clinData", clinData);
    },

    getIndividualGeneList(){
      for(const prop in this.selectedObj){
        var mergedGenes = model.mergeGenesAcrossPanels(this.selectedObj[prop]);
        let data = model.getIndividualGenes(mergedGenes ); //Gets the genes 
        
        //Add associated genes to the data 
        let associated_GenesIndividual = this.associatedGenesIndividualObject[prop]; 
        if(associated_GenesIndividual.length){
          associated_GenesIndividual.map(x => {
            x.value = 0; 
          })
        }
        
        if(associated_GenesIndividual.length){
          associated_GenesIndividual.map(x=>{
            var checkIfAssociatedGeneExist = obj => obj.name === x.name;
            if(data.some(checkIfAssociatedGeneExist)){
              var genes = [];
              data.map(y=>{
                genes.push(y.name);
              });
              var i = genes.indexOf(x.name);
              x.value = data[i].value;
              
              data.splice(i, 1);
              data = [...data];
            }
          })
        }
        
        let genes_data = []; 
        if(associated_GenesIndividual.length){
          associated_GenesIndividual.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0));
          genes_data = [...associated_GenesIndividual, ...data];
        }
        else{
          genes_data = data;
        }
        
        this.createSeperateGenesObj(genes_data, prop);
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
            var hpoPhenotype = this.getHpoPhenotype(x); 
            this.getHpoPhenotype(x);
            arr.push({
              searchTerm: x,
              hpoPhenotype: hpoPhenotype
            })
          }
        })
      }
      return arr;
    },

    getHpoPhenotype(id){
      var idx = this.HPO_Terms_data.indexOf(id);
      var phenotype = this.HPO_Phenotypes_data[idx];
      return phenotype; 
    },
    
    deleteAndRemoveGtrTermsFromInput(items, note, note_index){
      for(let i=0; i<items.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var idx = this.Gtr_searchTermArray.indexOf(items[i].DiseaseName);
            
            bus.$emit('pass_filteredDiseasesItems', this.diseasesProps);
            bus.$emit("removeGtrTerm", items[i].DiseaseName);
            
            this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(items[i].DiseaseName), 1)
            this.multipleSearchTerms = [...this.multipleSearchTerms];
            
            this.GtrTermsAdded.splice(idx, 1)
            this.GtrTermsAdded = [...this.GtrTermsAdded];
            this.Gtr_searchTermsObj.splice(idx, 1);
            this.Gtr_searchTermsObj = [...this.Gtr_searchTermsObj];
            this.Gtr_searchTermArray.splice(idx, 1);
            this.Gtr_searchTermArray = [...this.Gtr_searchTermArray];
            
            this.Gtr_idx = this.Gtr_idx - 1;
            this.gtr_push_idx = this.gtr_push_idx - 1;
            this.Gtr_search_complete_idx = this.Gtr_search_complete_idx -1;
            
          }, 200 + (2500 * ind));
        })(i);
      }
    },
    
    
    deleteAndRemovePhenolyzerTermsFromInput(items){
      for(let i=0; i<items.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var idx = this.Phenolyzer_searchTermArray.indexOf(items[i].value);
            
            bus.$emit("removePhenolyzerTerm", items[i].value);
            
            this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(items[i].value), 1)
            this.multipleSearchTerms = [...this.multipleSearchTerms];
            
            this.phenolyzerTermsAdded.splice(idx, 1)
            this.phenolyzerTermsAdded = [...this.phenolyzerTermsAdded];
            this.Phenolyzer_searchTermsObj.splice(idx, 1);
            this.Phenolyzer_searchTermsObj = [...this.Phenolyzer_searchTermsObj];
            this.Phenolyzer_searchTermArray.splice(idx, 1);
            this.Phenolyzer_searchTermArray = [...this.Phenolyzer_searchTermArray];
            
            this.Phenolyzer_idx = this.Phenolyzer_idx - 1;
            this.phenolyzer_push_idx = this.phenolyzer_push_idx - 1;
            this.Phenolyzer_search_complete_idx = this.Phenolyzer_search_complete_idx -1;
                        
          }, 200 + (2500 * ind));
        })(i);
      }
    },
    
    deleteAndRemoveHpoTermsFromInput(items){
      for(let i=0; i<items.length; i++){
        ((ind) =>{
          setTimeout(() =>{
            var idx = this.Hpo_searchTermArray.indexOf(items[i].hpoNumber);
            bus.$emit("removeHpoTerm", items[i]);
      
            this.multipleSearchTerms.splice(this.multipleSearchTerms.indexOf(items[i].HPO_Data), 1)
            this.multipleSearchTerms = [...this.multipleSearchTerms];
      
            this.hpoTermsAdded.splice(idx, 1)
            this.hpoTermsAdded = [...this.hpoTermsAdded];
            this.Hpo_searchTermsObj.splice(idx, 1);
            this.Hpo_searchTermsObj = [...this.Hpo_searchTermsObj];
            this.Hpo_searchTermArray.splice(idx, 1);
            this.Hpo_searchTermArray = [...this.Hpo_searchTermArray];
      
            this.Hpo_idx = this.Hpo_idx - 1;
            this.Hpo_search_complete_idx = this.Hpo_search_complete_idx -1;
      
          }, 200 + (2500 * ind));
        })(i);
      }
    },
    
    confirmToDeleteInputNote(note, idx) {
      this.noteToDelete = {
        note, idx
      }
      this.removeNoteConfirmationDialog = true; 
    },
    
    cancelDeleteInputNote(){
      this.noteToDelete = {};
      this.removeNoteConfirmationDialog = false;
    },

    deleteInputNote(note, idx){
      this.removeNoteConfirmationDialog = false;
      this.deletingNoteDialog = true;
      bus.$emit("show-gene-table-skeleton-loaders");
      this.showSearchTermsLoader = true;

      let note_details = this.clinical_note_text[idx];
      let gtr_terms_for_temp = [];
      let phenolyzer_terms_for_temp = [];
      let hpo_terms_for_temp = [];
      let basic_mode_terms_for_temp = [];

      note_details.gtr_terms.map(x => {
        if(this.Gtr_searchTermArray.includes(x.DiseaseName)){
          gtr_terms_for_temp.push(x);
        }
      })
      
      note_details.phenolyzer_terms.map(x => {
        if(this.Phenolyzer_searchTermArray.includes(x.value)){
          phenolyzer_terms_for_temp.push(x);
        }
      })
      
      note_details.hpo_terms.map(x => {
        if(this.Hpo_searchTermArray.includes(x.hpoNumber)){
          hpo_terms_for_temp.push(x);
        }
      })

      var max_count = Math.max(gtr_terms_for_temp.length, phenolyzer_terms_for_temp.length, hpo_terms_for_temp.length);

      this.deleteAndRemoveGtrTermsFromInput(gtr_terms_for_temp, note, idx);
      this.deleteAndRemovePhenolyzerTermsFromInput(phenolyzer_terms_for_temp);
      this.deleteAndRemoveHpoTermsFromInput(hpo_terms_for_temp);
      
      setTimeout(() => {
        this.clinical_note_text.splice(idx, 1);
        this.clinical_note_text = [...this.clinical_note_text];
        bus.$emit("hide-gene-table-skeleton-loaders")
        this.showSearchTermsLoader = false;
        this.deletingNoteDialog = false;
        var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text];
        this.$emit('saveSearchedPhenotypes', allPhenotypes)
      }, 200 + (3000 * max_count))
    },
    
    reSelectClinicalNote(note, idx){
      this.reReviewClinicalNote = true;
      this.searchStatusCompleteAlert = false;
      this.textNotes = note;
      this.note_rereview_idx = idx;
      let note_details = this.clinical_note_text[idx];
      this.note_reselect_gtrTerms_Array = [];
      this.note_reselect_phenolyzerTerms_Array = [];
      this.note_reselect_hpoTerms_Array = [];
      this.note_reselect_basicModeTerms_Array = [];
      let gtr_terms_for_temp = [];
      let phenolyzer_terms_for_temp = [];
      let hpo_terms_for_temp = [];
      let basic_mode_terms_for_temp = [];

      note_details.gtr_terms.map(x => {
        if(this.Gtr_searchTermArray.includes(x.DiseaseName)){
          this.note_reselect_gtrTerms_Array.push(x.DiseaseName);
          gtr_terms_for_temp.push(x);
        }
      })
      this.GtrTermsAdded_temp = gtr_terms_for_temp;

      note_details.phenolyzer_terms.map(x => {
        if(this.Phenolyzer_searchTermArray.includes(x.value)){
          this.note_reselect_phenolyzerTerms_Array.push(x.value);
          phenolyzer_terms_for_temp.push(x);
        }
      })
      this.phenolyzerTermsAdded_temp = phenolyzer_terms_for_temp;

      note_details.hpo_terms.map(x => {
        if(this.Hpo_searchTermArray.includes(x.hpoNumber)){
          this.note_reselect_hpoTerms_Array.push(x.HPO_Data);
          hpo_terms_for_temp.push(x);
        }
      })
      this.hpoTermsAdded_temp = hpo_terms_for_temp;
      
      note_details.basic_mode_terms.map(x => {
        if(this.BasicMode_SearchTermArray.includes(x.DiseaseName)){
          this.note_reselect_basicModeTerms_Array.push(x.DiseaseName);
          basic_mode_terms_for_temp.push(x);
        }
      })
      this.basicModeTermsAdded_temp = basic_mode_terms_for_temp;

      this.WorkflowStepsflag = false;
      this.LevenshteinResults = [];
      this.loadingDialog = true;
      this.extractedTerms = [];
      this.extractedTermsObj = [];
      this.demoTermsFlag = false;

      this.LevenshteinResults = note_details.LevenshteinResults;
      this.LevenshteinResults.map(x=>{
        x = x.trim()
        if(!this.extractedTerms.includes(x)){
          this.extractedTerms.push(x);
        }
      })

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

        this.phenolyzerTermsReturned = [];
        
        var data = this.setPhenolyzerTerms(str);
        data.then(res => {
          this.phenolyzerTermsReturned = res;
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

      setTimeout(()=>{
        this.loadingDialog = false;
        this.openReviewDialogForExtractedTerms();
      }, 1000)

      // this.extract();
    },
    
    extractHpoIds(str){
      var newStr = str; 
      var separators = [',', ';', ' ' ];
      var arr = newStr.split(new RegExp(separators.join('|'), 'g'));

      var ids = [];
      arr.map(x => {
        if(HPO_Terms.includes(x)) {
          ids.push(x);
        }
      })
      var hpoIds = Array.from(new Set(ids));
      if (hpoIds.length) {
        this.gtrSelectSwitch = false;
        this.phenolyzerSelectSwitch = false;
        this.hpoSelectSwitch = false;
        this.hpoTermsDetected = true;
        this.hpo_radios = "inputted_hpo_only"
      }
      return hpoIds;
    },
    
    getPhenotypesForHpoIds(arr){
      var hpoPhenotypes = []; 
      arr.map( id => {
        var idx = this.HPO_Terms_data.indexOf(id); 
        if(idx!== -1){
          hpoPhenotypes.push(this.HPO_Phenotypes_data[idx]);
        }
      })
      return hpoPhenotypes;
    },

    extract(){
      this.textNotes = this.textNotes.replace(/\n/g, ' ');
      var unwanted_char = String.fromCharCode(160);
      this.textNotes = this.textNotes.replace(new RegExp(unwanted_char, "g"), " ");

      this.gtrSelectSwitch = true;
      this.phenolyzerSelectSwitch = true;
      this.hpoSelectSwitch = true;
      
      bus.$emit("filterOnSpecificityScore", false);
      bus.$emit("filterOnGenesOverlap", false);

      this.gtr_terms_expansion_panel = [];
      this.phenolyzer_terms_expansion_panel = [];
      this.WorkflowStepsflag = false;
      this.LevenshteinResults = [];
      this.loadingDialog = true;
      this.extractedTerms = [];
      this.extractedTermsObj = [];
      this.demoTermsFlag = false;
      this.hpoIds = [];
      this.searchStatusCompleteAlert = false;
      this.hpoTermsDetected = false;
      this.showWarningOfMissedHpoTerms = false;
      var hpoIds = this.extractHpoIds(this.textNotes);
      var hpoPhenos = this.getPhenotypesForHpoIds(hpoIds);
      this.hpoExtractedPhenotypesFromIds = hpoPhenos;
      this.hpoExtractedIds = hpoIds;
      // Mosaic endpoint: https://mosaic.chpc.utah.edu/gru/api/v1
      // fetch(`http://nv-dev-new.iobio.io/phenotype-extractor/?notes=${this.textNotes}`)
      // fetch(`http://dev.backend.iobio.io:9003/phenotypeExtractor?notes=${this.textNotes}`)
      // fetch(`https://backend.iobio.io/phenotypeExtractor?notes=${this.textNotes}`)      
      fetch(`https://backend.iobio.io/phenotypeExtractor?notes=${this.textNotes}`)
        .then(res => res.text())
        .then(text => {
          // console.log("text", text);
          var res = text.replace('JaroWinkler', '"JaroWinkler"').replace('fuzzyResults', '"fuzzyResults"').replace('LevenshteinResults', '"LevenshteinResults"').replace('hpoIds', '"hpoIds"').replace(/'/g, '"');
          var data;
          // console.log("res", res);
          try {
            data = JSON.parse(res);
          }
          catch(e) {
            alert("Sorry. The fetch for this input currently failed. Please try a different term")
            this.loadingDialog = false;
          }
          // var data = JSON.parse(res);
          data.hpoIds = hpoIds;
          this.hpoIds = data.hpoIds;
          // console.log("this.hpoIds",this.hpoIds);
          // console.log("data.LevenshteinResults", data.LevenshteinResults);
          if(this.textNotes.toLowerCase().includes("aplasia of the left hemidiaphragm".toLowerCase())){
            data.LevenshteinResults.push("Aplasia of the left hemidiaphragm")
          }
          
          var termsToExclude = ['short long bones'];
          
          data.LevenshteinResults = data.LevenshteinResults.filter(item => !termsToExclude.includes(item))
          data.LevenshteinResults = [...data.LevenshteinResults, ...hpoPhenos];
          this.LevenshteinResults = data.LevenshteinResults;
          data.LevenshteinResults.map(x=>{
            x = x.trim()
            if(!this.extractedTerms.includes(x)){
              this.extractedTerms.push(x);
            }
          })
          this.HpoReviewTerms = [];
          this.fetchHpoTerm();

          this.extractedTerms.map(x=>{
            this.extractedTermsObj.push({
              DiseaseName: x,
            })
          })

          this.phenolyzerReviewTerms = this.extractedTermsObj;
          this.phenolyzerTermsReturned = [];

          this.phenolyzerReviewTerms.map((item, i) => {
            item.reviewTerms_phenolyzer = [];

            var str = item.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase();
            str = str.replace("disease", "");
            str = str.replace("syndrome", "");
            str = str.trim();
            
            var data = this.setPhenolyzerTerms(str);
            data.then(res => {
              this.phenolyzerTermsReturned.push(item); 
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

          // this.loadingDialog = false;
          // this.clinical_note_text.unshift({
          //   "note": this.textNotes
          // });

          //check this for saving phenotype data
          // var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text];
          // this.$emit('saveSearchedPhenotypes', allPhenotypes)
          this.openReviewDialogForExtractedTerms();
        })
    },
    fetchHpoTerm(){
      this.HpoloadingProgressBar = true;
      var hpoPhenosString = this.hpoExtractedPhenotypesFromIds.join();
      const cmd = api.clinphen({ notes: `${hpoPhenosString},${this.textNotes}`});
      cmd.then((data) => {
        this.parseTerms(data);
      });
      // var clinicalNote = `${hpoPhenosString},${this.textNotes}`
      // fetch(`https://mosaic.chpc.utah.edu/gru-dev/clinphen?notes=${clinicalNote}`)
      //   .then(res => res.text())
      //   .then(data => {
      //     this.parseTerms(data);
      //   })
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

          if(phenotype === "Aplasia of the left hemidiaphragm"){
            hpoNumber = "HP:0009112";
          }
          
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
      if(!this.HpoReviewTerms.length){
        this.matchHpoTermsFromCustomDB();
      }
      
      //Ensures the inputted HPO terms are shown at the top
      var inputtedTerms = [];
      var clinPhenFoundTerms = [];
      var temp_HpoReviewTerms = [];
      if(this.hpoExtractedPhenotypesFromIds.length){
        this.HpoReviewTerms.map(term => {
          if(this.hpoIds.includes(term.hpoNumber)){
            inputtedTerms.push(term);
          }
          else {
            clinPhenFoundTerms.push(term);
          }
        })
        
        
        //Check for terms if missed by clinphen
        var missedTerms = [];
        if(inputtedTerms.length < this.hpoExtractedIds.length){
          var missingTerms = [];
          var inputtedPhenotypes = [];
          inputtedTerms.map (x => {
            inputtedPhenotypes.push(x.phenotype);
          })
          this.hpoExtractedPhenotypesFromIds.map(x => {
            if(!inputtedPhenotypes.includes(x)){
              missingTerms.push(x)
            }
          })
          if(missingTerms.length){
            missedTerms = this.matchHpoTermsFromCustomDBForMissingTerms(missingTerms)
          }
        }
        
        if((inputtedTerms.length + missedTerms.length) < this.hpoExtractedIds.length){
          this.showWarningOfMissedHpoTerms = true; 
        }
        
        temp_HpoReviewTerms = [...inputtedTerms, ...missedTerms, ...clinPhenFoundTerms];
        this.HpoReviewTerms = temp_HpoReviewTerms;
      }
      
      
      this.HpoloadingProgressBar = false;
      // this.HpoReviewTerms = hpoTermArr;
    },
    
    matchHpoTermsFromCustomDBForMissingTerms(terms){
      var obj = {}; 
      terms.map(term => {
        if(obj[term.trim().toLowerCase()] === undefined){
          obj[term.trim().toLowerCase()] = true;
        }
      })
      let hpoTermArr = []; 
      this.HPO_Phenotypes_data.map((term, indx) => {
        if(obj.hasOwnProperty(term.trim().toLowerCase())){
          let idx = indx;
          let hpoNumber = this.HPO_Terms_data[idx];
          hpoTermArr.push({
            hpoNumber:hpoNumber,
            phenotype:term,
            occurrences:"",
            earliness:"",
            sentence:"",
            HPO_Data: `${term} - [ ${hpoNumber} ] `
          })
        }
      })
      var addToMissingTerms = [];
      hpoTermArr.forEach(x => {
        var found = this.HpoReviewTerms.some(el => el.HPO_Data === x.HPO_Data);
        if(!found){ addToMissingTerms.push(x)}
      })
      return addToMissingTerms;
    },
    matchHpoTermsFromCustomDB(){
      var obj = {}; 
      this.extractedTerms.map(term => {
        if(obj[term.trim().toLowerCase()] === undefined){
          obj[term.trim().toLowerCase()] = true;
        }
      })
      let hpoTermArr = []; 
      this.HPO_Phenotypes_data.map((term, indx) => {
        if(obj.hasOwnProperty(term.trim().toLowerCase())){
          let idx = indx;
          let hpoNumber = this.HPO_Terms_data[idx];
          hpoTermArr.push({
            hpoNumber:hpoNumber,
            phenotype:term,
            occurrences:"",
            earliness:"",
            sentence:"",
            HPO_Data: `${term} - [ ${hpoNumber} ] `
          })
        }
      })
      hpoTermArr.forEach(x => {
        var found = this.HpoReviewTerms.some(el => el.HPO_Data === x.HPO_Data);
        if(!found){ this.HpoReviewTerms.push(x)}
      })
    },
    setPhenolyzerTerms(str){
      if(str === 'gross motor delays'){
        str = 'gross motor delay'
      }
      var encodedStr = encodeURIComponent(str.trim());
      return fetch(`https://backend.iobio.io/hpo/hot/lookup/?term=${encodedStr}`)
          .then(response => response.json())
          .then(data => {
            return data
          })
    },
    openReviewDialog(){
      this.gtr_terms_expansion_panel = [];
      this.phenolyzer_terms_expansion_panel = [];
      this.WorkflowStepsflag = false;
      this.LevenshteinResults = [];
      this.loadingDialog = true;
      this.extractedTerms = [];
      this.extractedTermsObj = [];
      this.demoTermsFlag = false;
      this.hpoIds = [];

      this.textNotes = this.search.DiseaseName.toLowerCase();
      // this.LevenshteinResults.push(this.search.DiseaseName)
      this.LevenshteinResults = [this.search.DiseaseName]; //when input is selected from typeahead
      // this.clinical_note_text.unshift(this.textNotes);

      //check this for saving phenotype data
      // var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text];
      // this.$emit('saveSearchedPhenotypes', allPhenotypes)
      // console.log("this.LevenshteinResults", this.LevenshteinResults);
      this.LevenshteinResults.map(x=>{
        x = x.trim()
        if(!this.extractedTerms.includes(x)){
          this.extractedTerms.push(x);
        }
      })
      
      this.extractedTerms.map(x=>{
        this.extractedTermsObj.push({
          DiseaseName: x,
        })
      })


      this.GtrReviewTerms = [];
      this.termsExpansionPanel = ['true'];
      this.demoTermsFlag = false;
      // this.GtrReviewTerms.push(this.search);
      this.GtrReviewTerms = this.extractedTermsObj;
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
      // this.phenolyzerReviewTerms.push(this.search);
      this.phenolyzerReviewTerms = this.extractedTermsObj;

      this.phenolyzerReviewTerms[0].reviewTerms_phenolyzer = []

      var str = this.search.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase();
      str = str.replace("disease", "");
      str = str.replace("syndrome", "");
      // str = str.replace("disorder", "");
      str = str.trim();

      this.phenolyzerTermsReturned = [];
      
      var data = this.setPhenolyzerTerms(str);
      data.then(res => {
        this.phenolyzerTermsReturned = res;
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

      this.basicModeTermsAdded_temp = this.extractedTermsObj;
      setTimeout(()=> {
        this.setTermsSelectedFromBasicModeForReview()
      }, 4000)


    setTimeout(()=>{
        this.termsReviewDialog = true;
        this.termsReviewDialogPage = 0;
        this.loadingDialog = false;
    },500)

    },
    closeReviewDialog(){
      //Closes the review dialog box 
      this.termsReviewDialog=false;
      this.termsReviewDialogPage = 0;
      this.GtrTermsAdded_temp = [];
      this.phenolyzerTermsAdded_temp = [];
      this.hpoTermsAdded_temp = [];
      this.basicModeTermsAdded_temp = [];
      if(!this.reReviewClinicalNote){ //Closing the review dialog without selecting any terms still adds the note
        if(!this.GtrTermsAdded_temp.length && !this.phenolyzerTermsAdded_temp.length && !this.hpoTermsAdded_temp.length){
          this.termsReviewDialog = false;
        }

        // this.clinical_note_text.unshift({
        //   "note": this.textNotes,
        //   "gtr_terms": [],
        //   "phenolyzer_terms": [],
        //   "hpo_terms": [],
        //   "LevenshteinResults": this.LevenshteinResults,
        //   "basic_mode_terms": [],
        // });
        // var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text, this.basicModeTermsAdded];
        // this.$emit('saveSearchedPhenotypes', allPhenotypes)
      }
      this.reReviewClinicalNote = false;
    },
    mouseSelect(){
      if(this.search!==undefined){
        this.WorkflowStepsflag = false;
        this.loadingDialog = true;
        // this.checkBeforeAddTerm();
        setTimeout(()=>{
          // this.checkBeforeAddTerm();
          this.textNotes = this.search.DiseaseName.toLowerCase();
          this.LevenshteinResults = [this.search.DiseaseName]; //when input is selected from typeahead
          this.extract();
          // this.openReviewDialog();
        }, 1000)
      }
    },
    EnterForSearch(){
      if(event.key === 'Enter') {
        this.WorkflowStepsflag = false;
        setTimeout(()=>{
          // this.checkBeforeAddTerm();
          this.textNotes = this.search.DiseaseName.toLowerCase();
          this.LevenshteinResults = [this.search.DiseaseName]; //when input is selected from typeahead
          this.extract();
          // this.openReviewDialog();
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

        // filter duplicate gtr search term suggestions in review dialog
        item.reviewTerms_gtr = item.reviewTerms_gtr.filter((gtr_term, index, self) =>
          index === self.findIndex((t) => (
            t.DiseaseName === gtr_term.DiseaseName
          ))
        )

      })
      
      //Filters out the terms that do not have "reviewTerms_gtr"
      this.GtrReviewTerms = this.GtrReviewTerms.filter(term => {
        return term.reviewTerms_gtr.length > 0;
      })
      
      if(!this.reReviewClinicalNote) {
        this.basicModeTermsAdded_temp = this.extractedTermsObj; 
        var interval = setInterval(() => {
            if(!this.HpoloadingProgressBar && this.phenolyzerTermsReturned.length === this.extractedTermsObj.length){
                clearInterval(interval);
                this.setTermsSelectedFromBasicModeForReview()
            }
        }, 1000);     
      }
      else {
        //If it is a reselected note
        setTimeout(()=>{
            this.termsReviewDialog = true;
            this.termsReviewDialogPage = 0;
            this.loadingDialog = false;
        },500)
      }


      // setTimeout(()=>{
      //     this.termsReviewDialog = true;
      //     this.termsReviewDialogPage = 0;
      //     this.loadingDialog = false;
      // },500)

    },

    checkIf_newNote_or_reReview(){
      if(!this.reReviewClinicalNote){
        
        var basic_mode_terms = [];
        this.basicModeTermsAdded_temp.map(x => {
          var temp = {
            DiseaseName: x.DiseaseName,
            reviewTerms_gtr: x.reviewTerms_gtr,
            reviewTerms_phenolyzer: x.reviewTerms_phenolyzer,
            GtrTermSelected: x.GtrTermSelected,
            PhenolyzerTermSelected: x.PhenolyzerTermSelected,
            HpoTermSelected: x.HpoTermSelected,
          }
          basic_mode_terms.push(temp);
        })
        
        var hpo_terms = [];
        this.hpoTermsAdded_temp.map(x => {
          var temp = {
            hpoNumber: x.hpoNumber,
            phenotype: x.phenotype,
            HPO_Data: x.HPO_Data,
            hpoSearchStatus: x.hpoSearchStatus,
            DiseaseName: x.DiseaseName,
            occurrences: x.occurrences,
            earliness: x.earliness,
            sentence: x.sentence
          }
          hpo_terms.push(temp);
        })

        var gtr_terms = [];
        this.GtrTermsAdded_temp.map(x => {
          var temp = {
            DiseaseName: x.DiseaseName,
            ConceptID: x.ConceptID,
            gtrSearchStatus: x.gtrSearchStatus,
            general: x.general,
          }
          gtr_terms.push(temp);
        })

        var phenolyzer_terms = [];
        this.phenolyzerTermsAdded_temp.map(x=>{
          var temp = {
            id: x.id,
            label: x.label,
            phenolyzerSearchStatus: x.phenolyzerSearchStatus,
            general: x.general,
            value: x.value
          }
          phenolyzer_terms.push(temp);
        })

        // var gtr_terms = Array.from(this.GtrTermsAdded_temp);
        // var phenolyzer_terms = [...this.phenolyzerTermsAdded_temp];
        // var hpio1_terms = this.hpoTermsAdded_temp.slice();
        this.clinical_note_text.unshift({
          "note": this.textNotes,
          // "gtr_terms": this.GtrTermsAdded_temp,
          // "phenolyzer_terms": [{id:"hydrocephalus", value:"hydrocephalus", labbel:"hydrocephalus", genral:true, phenolyzerSearchStatus: "Completed" }],
          "gtr_terms": gtr_terms,
          "hpo_terms": hpo_terms,
          "phenolyzer_terms": phenolyzer_terms,
          "LevenshteinResults": this.LevenshteinResults,
          "basic_mode_terms": basic_mode_terms
          // "gtrSearchStatus": this.gtrSearchStatus
        });
      }
      else { //If it is a rereview
        this.clinical_note_text[this.note_rereview_idx].gtr_terms = this.GtrTermsAdded_temp;
        this.clinical_note_text[this.note_rereview_idx].phenolyzer_terms = this.phenolyzerTermsAdded_temp;
        this.clinical_note_text[this.note_rereview_idx].hpo_terms = this.hpoTermsAdded_temp;
        this.clinical_note_text[this.note_rereview_idx].basic_mode_terms = this.basicModeTermsAdded_temp;
        this.clinical_note_text[this.note_rereview_idx].LevenshteinResults = this.LevenshteinResults;
        // this.clinical_note_text[this.note_rereview_idx].gtrSearchStatus = this.gtrSearchStatus;

        this.reReviewClinicalNote = false;
        this.note_reselect_gtrTerms_Array = [];
        this.note_reselect_phenolyzerTerms_Array = [];
        this.note_reselect_hpoTerms_Array = [];
        this.note_reselect_basicModeTerms_Array = [];
        this.note_rereview_idx = null;
      }
    },

    selectReviewTerms(){
      bus.$emit("filterOnSpecificityScore", false);
      bus.$emit("filterOnGenesOverlap", false);

      if(!this.GtrTermsAdded_temp.length && !this.phenolyzerTermsAdded_temp.length && !this.hpoTermsAdded_temp.length){
        this.termsReviewDialog = false;
        this.termsReviewDialogPage = 0;
      }
      else {
        this.$emit("new_term_searched", true);
        this.gtr_terms_expansion_panel = []; //ensures that all expansion panels are closed when opened for edit 
        this.phenolyzer_terms_expansion_panel = []; 
        
        let container = document.querySelector("#termsReviewDialogContainer-target"); 
        container.scrollTop = 0

        this.checkIf_newNote_or_reReview();

        if(!this.GtrTermsAdded_temp.length && !this.phenolyzerTermsAdded_temp.leng && !this.hpoTermsAdded_temp.leng){
          this.checkToCloseSearchStatusDialog();
        }

        this.GtrTermsAdded_temp = this.GtrTermsAdded_temp.filter(o1 => this.GtrTermsAdded.every(o2 => {
          return o1.DiseaseName !== o2.DiseaseName
        })); //Delets duplicate entries
        this.GtrTermsAdded = [...this.GtrTermsAdded, ...this.GtrTermsAdded_temp];
        // this.$emit("GtrTerms", this.GtrTermsAdded); //Pass back which can be used in phenotypes component .

        this.phenolyzerTermsAdded_temp = this.phenolyzerTermsAdded_temp.filter(o1 => this.phenolyzerTermsAdded.every(o2 => {
          return o1.value !== o2.value
        }));
        this.phenolyzerTermsAdded = [...this.phenolyzerTermsAdded, ...this.phenolyzerTermsAdded_temp];

        this.hpoTermsAdded_temp = this.hpoTermsAdded_temp.filter(o1 => this.hpoTermsAdded.every(o2 => {
          return o1.HPO_Data !== o2.HPO_Data
        }));
        this.hpoTermsAdded = [...this.hpoTermsAdded, ...this.hpoTermsAdded_temp];
        
        this.basicModeTermsAdded_temp = this.basicModeTermsAdded_temp.filter(o1 => this.basicModeTermsAdded.every(o2 => {
          return o1.HPO_Data !== o2.HPO_Data
        }));
        this.basicModeTermsAdded = [...this.basicModeTermsAdded, ...this.basicModeTermsAdded_temp];
        
        this.BasicMode_SearchTermArray = [];
        this.basicModeTermsAdded.map( term => {
          this.BasicMode_SearchTermArray.push(term.DiseaseName);
        })
        

        this.GtrTermsAdded_temp = [];
        this.phenolyzerTermsAdded_temp = [];
        this.hpoTermsAdded_temp = [];
        this.basicModeTermsAdded_temp = [];
        // console.log("this.GtrTermsAdded", this.GtrTermsAdded)
        var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text, this.basicModeTermsAdded];
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
      if(this.Gtr_idx === this.Gtr_searchTermsObj.length){ //Checks if there are no new items are added even when the terms review dialog was opened. 
        setTimeout(() => {
          this.checkToCloseSearchStatusDialog(); 
        }, 500)
      }
      else {
        if(this.Gtr_idx<this.Gtr_searchTermsObj.length){
          this.gtrFetchCompleted = false;
        }

        let startVal = this.Gtr_idx;
        for(let i=startVal; i<this.Gtr_searchTermsObj.length; i++){
          ((ind) =>{
            setTimeout(() =>{
              this.$set(this.Gtr_searchTermsObj[i], 'gtrSearchStatus', "Searching");
              bus.$emit("singleTermSearchGTR", this.Gtr_searchTermsObj[i]);
              this.Gtr_idx = this.Gtr_idx + 1;
            }, 200 + (2500 * ind));
          })(i);
        }
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
          }, 200 + (2500 * ind));
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
      this.GtrGenesForSummary = this.items;
      this.$emit("GtrGeneList", this.GtrGenesForSummary);

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
      // console.log("diseases", diseases)
      this.checkForAssociatedGenesIndividual(diseases.searchTerm);
      this.AddGenePanelDataIndividual(this.diseasesPropsIndividual, diseases.searchTerm)
    },
    checkForAssociatedGenesIndividual: function(searchTerm){
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
      if(this.associatedGenesIndividualObject[searchTerm] === undefined){
        this.associatedGenesIndividualObject[searchTerm] = this.associatedGenesIndividual; 
      }
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
      if(this.Phenolyzer_idx === this.Phenolyzer_searchTermsObj.length){
        setTimeout(() => {
          this.checkToCloseSearchStatusDialog(); 
        }, 500)
      }
      else {
        if(this.Phenolyzer_idx<this.Phenolyzer_searchTermsObj.length){
          this.phenolyzerFetchCompleted = false;
        }

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
      this.$emit('PhenolyzerGeneList', this.PhenolyzerGenesForSummary)
    },

    Hpo_performSearchEvent(){
      if(this.Hpo_idx === this.Hpo_searchTermsObj.length){
        setTimeout(() => {
          this.checkToCloseSearchStatusDialog(); 
        }, 500)
      }
      else {
        if(this.Hpo_idx<this.Hpo_searchTermsObj.length){
          this.hpoFetchCompleted = false;
        }
        // this.hpoFetchCompleted = false;
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
      }
    },

    Hpo_performSearchEvent_saved(){
      // this.hpoFetchCompleted = false;
      // console.log("performing saved search")
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
      // console.log("hpo genes", genes);
      this.clinPhenSelectedGenes = genes;
      this.$emit("HpoGeneList", this.clinPhenSelectedGenes);
      this.countNumberOfHpoSources(genes);
    },
    
    countNumberOfHpoSources(genes){
      var obj = {};
      var arr =[];
      if (genes.length) {
        var len = genes[0].hpoSource; 
        
        for(var i=1; i<=len; i++){
          if(obj[i] === undefined){
            obj[i] = 0;
          }
        }
        
        genes.map (x => {
          obj[x.hpoSource] = obj[x.hpoSource] + 1;
        })
        
        for(var prop in obj ){
          arr.push({"name": prop, "count": obj[prop]})
        }
      // console.log("obj", obj);
      }
      // console.log("arr", arr);
      this.hpoGenesCountForBarChart = arr;
      // this.drawHpoGenesBarChart();
      drawHpoGenesBarChart(this.hpoGenesCountForBarChart);
      // this.drawHistogram()
    },

    hpoIndividualGenes(obj){

    },

    checkToCloseSearchStatusDialog(){
      if(this.gtrFetchCompleted && this.phenolyzerFetchCompleted && this.hpoFetchCompleted){
        this.searchStatusDialogTimeoutCheck = setTimeout(()=>{
          // this.searchStatusDialog = false;
          this.searchStatusCompleteAlert = true;
          setTimeout(() => {
            this.$emit("new_term_searched", false);
          },5000)
          if(this.summaryAllGenes.length){
            this.countGeneListUpdated = this.countGeneListUpdated+1; 
          }
          if(this.countGeneListUpdated === 1){ //to show an alert when the gene list is generated for the first time
            this.showInfoThatStepIsComplete = true; 
            setTimeout(() => {
              this.showInfoThatStepIsComplete = false; 
            }, 40000)
          }
          else if(this.countGeneListUpdated > 1){
            this.showGeneListReadySnackbar = true; 
          }
        }, 3000)
      }
      else{
        clearTimeout(this.searchStatusDialogTimeoutCheck); 
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
    
    removePhenotypeShowDialog(item, idx, component){
      this.removePhenotypeDialog = true; 
      this.toDeletePhenotype = {
        item, 
        idx, 
        component
      }
      if(component === 'GTR'){
        this.deletePhenotypeConfirmationText = `Are you sure you want to delete the condition <strong>${item.DiseaseName}</strong>?`
      }
      else if(component === 'phenolyzer'){
        this.deletePhenotypeConfirmationText = `Are you sure you want to delete the phenotype <strong>${item.value}</strong>?`
      }
      else if(component === 'HPO'){
        this.deletePhenotypeConfirmationText = `Are you sure you want to delete the HPO term <strong>${item.HPO_Data}</strong>?`
      }
    }, 
    
    cancelRemovePhenotype(){
      this.removePhenotypeDialog = false; 
      this.deletePhenotypeConfirmationText = '', 
      this.toDeletePhenotype = {}; 
    }, 


    remove(item, idx, component){
      bus.$emit("show-gene-table-skeleton-loaders");
      this.removePhenotypeDialog = false; 
        if(component === 'GTR'){
          if(this.has_saved_state){ //Ensures that genes of other tools are passed to the summary to built the list
            if(!this.phenolyzerSavedState && !this.hpoSavedState){
              this.sendPhenolyzerGenesToSummary(this.phenolyzerItems);
              this.sendHpoGenesToSummary(this.hpoItems);
              this.addDiseases(this.filteredDiseasesItemsArray);
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
          this.Gtr_search_complete_idx = this.Gtr_search_complete_idx -1;
          this.hovered_gtr_term='';
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
          this.Phenolyzer_search_complete_idx = this.Phenolyzer_search_complete_idx - 1;
          this.hovered_phenolyzer_term='';
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
          this.Hpo_search_complete_idx = this.Hpo_search_complete_idx - 1;
          this.hovered_hpo_term='';
        }

        var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text];
        this.$emit('saveSearchedPhenotypes', allPhenotypes)
        setTimeout(()=>{
          bus.$emit("hide-gene-table-skeleton-loaders")
        }, 2000)
        
        this.toDeletePhenotype = {}; 
        this.deletePhenotypeConfirmationText = ''; 
      }, //end remove() method
      
      removeSelectedTermFromReview(term, i, component){
        if (component === 'GTR') {
          this.note_reselect_gtrTerms_Array.splice(this.note_reselect_gtrTerms_Array.indexOf(term.DiseaseName), 1);
          this.note_reselect_gtrTerms_Array = [...this.note_reselect_gtrTerms_Array];
          var indx = this.Gtr_searchTermArray.indexOf(term.DiseaseName);
          this.remove(term, indx, component);
          this.removeReviewTerms(term, indx, component);
        }
        else if (component === 'phenolyzer') {
          this.note_reselect_phenolyzerTerms_Array.splice(this.note_reselect_phenolyzerTerms_Array.indexOf(term.value), 1);
          this.note_reselect_phenolyzerTerms_Array = [...this.note_reselect_phenolyzerTerms_Array];
          var indx = this.Phenolyzer_searchTermArray.indexOf(term.value);
          this.remove(term, indx, component);
          this.removeReviewTerms(term, indx, component);
        }
        else if (component === 'HPO') {
          this.note_reselect_hpoTerms_Array.splice(this.note_reselect_hpoTerms_Array.indexOf(term.HPO_Data), 1);
          this.note_reselect_hpoTerms_Array = [...this.note_reselect_hpoTerms_Array];
          var indx = this.Hpo_searchTermArray.indexOf(term.hpoNumber);
          this.remove(term, indx, component);
          this.removeReviewTerms(term, indx, component);
        }
        else if (component === 'BasicMode') {
          this.note_reselect_basicModeTerms_Array.splice(this.note_reselect_basicModeTerms_Array.indexOf(term.DiseaseName), 1);
          this.note_reselect_basicModeTerms_Array = [...this.note_reselect_basicModeTerms_Array];
          var indx = this.BasicMode_SearchTermArray.indexOf(term.DiseaseName);
          var item = this.basicModeTermsAdded_temp[indx]; //This has information such 'GtrTermSelected', 'HpoTermSelected', 'PhenolyzerTermSelected'
          this.removeReviewTerms(term, indx, component);
          
          //Remove GTR terms
          this.note_reselect_gtrTerms_Array.splice(this.note_reselect_gtrTerms_Array.indexOf(term.DiseaseName), 1);
          this.note_reselect_gtrTerms_Array = [...this.note_reselect_gtrTerms_Array];
          var gtr_indx = this.Gtr_searchTermArray.indexOf(term.DiseaseName);
          this.remove(term, gtr_indx, 'GTR');
          this.removeReviewTerms(term, indx, 'GTR');

          //Remove Phenolyzer terms 
          let PhenolyzerTermSelected = term.reviewTerms_phenolyzer[0]
          this.note_reselect_phenolyzerTerms_Array.splice(this.note_reselect_phenolyzerTerms_Array.indexOf(PhenolyzerTermSelected.value), 1);
          this.note_reselect_phenolyzerTerms_Array = [...this.note_reselect_phenolyzerTerms_Array];
          var phenolyzer_indx = this.Phenolyzer_searchTermArray.indexOf(PhenolyzerTermSelected.value);
          this.remove(PhenolyzerTermSelected, phenolyzer_indx, 'phenolyzer');
          this.removeReviewTerms(PhenolyzerTermSelected, phenolyzer_indx, 'phenolyzer');
          
          //Remove HPO term if exists
          if(item.HpoTermSelected){
            let HpoTermSelected = item.HpoTermSelected; 
            this.note_reselect_hpoTerms_Array.splice(this.note_reselect_hpoTerms_Array.indexOf(HpoTermSelected.HPO_Data), 1);
            this.note_reselect_hpoTerms_Array = [...this.note_reselect_hpoTerms_Array];
            var hpo_indx = this.Hpo_searchTermArray.indexOf(HpoTermSelected.hpoNumber);
            this.remove(HpoTermSelected, hpo_indx, 'HPO');
            this.removeReviewTerms(HpoTermSelected, hpo_indx, 'HPO');
          }
        }
      },

      removeReviewTerms(item, idx, component){
        if(component === 'GTR'){
          this.GtrTermsAdded_temp.splice(idx,1);
          this.GtrTermsAdded_temp = [...this.GtrTermsAdded_temp];
        }
        else if(component === 'phenolyzer'){
          this.phenolyzerTermsAdded_temp.splice(idx,1);
          this.phenolyzerTermsAdded_temp = [...this.phenolyzerTermsAdded_temp];
        }
        else if(component === 'HPO'){
          this.hpoTermsAdded_temp.splice(idx,1);
          this.hpoTermsAdded_temp = [...this.hpoTermsAdded_temp];
        }
        else if(component === 'BasicMode'){
          this.basicModeTermsAdded_temp.splice(idx,1);
          this.basicModeTermsAdded_temp = [...this.basicModeTermsAdded_temp];
        }
      },

      emit_venn_data(data){
        this.$emit("vennData", data)
      },

      venn_diag_summaryObj(obj){
        this.$emit("VennDiagramData", obj)
      },

      toggle_expansion_panel(i, component){
        if(component === 'GTR'){
          if(!this.gtr_terms_expansion_panel.includes(i)){
            this.gtr_terms_expansion_panel.push(i);
          }
          else {
            let idx = this.gtr_terms_expansion_panel.indexOf(i);
            this.gtr_terms_expansion_panel.splice(idx, 1);
          }
        }
        else if(component === 'Phenolyzer'){
          if(!this.phenolyzer_terms_expansion_panel.includes(i)){
            this.phenolyzer_terms_expansion_panel.push(i);
          }
          else {
            let idx = this.phenolyzer_terms_expansion_panel.indexOf(i);
            this.phenolyzer_terms_expansion_panel.splice(idx, 1);
          }
        }
      },

      mouseOverGtrTerm(term){
        this.hovered_gtr_term = term;
      },

      mouseOverPhenolyzerTerm(term){
        this.hovered_phenolyzer_term = term;
      },

      mouseOverHpoTerm(term){
        this.hovered_hpo_term = term;
      },

      mouseOverGtrTerm_review(term){
        this.hovered_gtr_term_review = term;
      },

      mouseOverPhenolyzerTerm_review(term){
        this.hovered_phenolyzer_term_review = term;
      },

      mouseOverHpoTerm_review(term){
        this.hovered_hpo_term_review = term;
      },

      toggle_gene_overlap_button(){
        let ref_genesoverlap = document.getElementById('genesOverlap');
        if(this.genesOverlap){
          this.genesOverlap = false;
          ref_genesoverlap.style.height="0";
          ref_genesoverlap.style.visibility="hidden";
          bus.$emit("close_genes_overlap_panel");
        }
        else {
          this.genesOverlap = true;
          ref_genesoverlap.style.height="300px";
          ref_genesoverlap.style.visibility="";
          bus.$emit("open_genes_overlap_panel");
        }
      }, 
      
      openTermsReviewDialogPage(pageNumber){
        this.editReviewSelectedTerms = true; 
        this.GtrTermsAdded_temp_editMode = this.GtrTermsAdded_temp; 
        this.phenolyzerTermsAdded_temp_editMode = this.phenolyzerTermsAdded_temp; 
        this.hpoTermsAdded_temp_editMode = this.hpoTermsAdded_temp; 
        if(pageNumber===1){
          this.termsReviewDialogPage=1;
        }
        else if(pageNumber===2){
          this.termsReviewDialogPage=2;
        }
        else if(pageNumber===3){
          this.termsReviewDialogPage=3;
        }
      }, 
      
      clearEditMode(optionsSelected){
        this.editReviewSelectedTerms = false; 
        if(optionsSelected==="save"){
          this.termsReviewDialogPage=4;
        }
        else{
          this.GtrTermsAdded_temp = this.GtrTermsAdded_temp_editMode
          this.phenolyzerTermsAdded_temp = this.phenolyzerTermsAdded_temp_editMode; 
          this.hpoTermsAdded_temp = this.hpoTermsAdded_temp_editMode; 
          this.termsReviewDialogPage=4;
        }
        this.GtrTermsAdded_temp_editMode =[]; 
        this.phenolyzerTermsAdded_temp_editMode = []; 
        this.hpoTermsAdded_temp_editMode = []; 
      }, 
      
      navigateTermsReviewDialog(navigation, selector){
        if(navigation==='back'){
          if(this.basicTermsSelectionMode){
            this.termsReviewDialogPage = 0;
          }
          else {
            this.termsReviewDialogPage = this.termsReviewDialogPage - 1; 
          }
        }
        else if(navigation==='next'){
          if(this.termsReviewDialogPage === 0){
            // this.setTermsSelectedFromBasicModeForReview();
            this.basicTermsSelectionMode = false;
          }
          this.termsReviewDialogPage = this.termsReviewDialogPage + 1; 
        }
        else if(navigation==='review'){
          // this.setTermsSelectedFromBasicModeForReview();
          
          this.termsReviewDialogPage = 4; 
        }
        this.gtr_terms_expansion_panel = []; //ensures that all expansion panels are closed when opened for edit 
        this.phenolyzer_terms_expansion_panel = []; 

        let container = document.querySelector("#termsReviewDialogContainer-target"); 
        container.scrollTop = 0
      },
      
      closeSearchStatusDialog(){
        this.searchStatusDialog=false;
        this.$emit("close_search_status_dialog")
      },
      
      setTermsSelectedFromBasicModeForReview(){
        var hpoPhenotypes = [];
        var hpoAddedTerms = [];
        this.HpoReviewTerms.map(item => {
          hpoPhenotypes.push(item.phenotype); 
        })
        this.GtrTermsAdded_temp = [];
        this.phenolyzerTermsAdded_temp = [];
        this.hpoTermsAdded_temp = [];
        
        //This is for the condition when there are only HPO terms but no extracted terms. 
        //Example term: high arched palate Issue: https://github.com/iobio/genepanel.iobio/issues/374
        
        if(!this.basicModeTermsAdded_temp.length && this.HpoReviewTerms.length){
          if(!this.hpoTermsDetected || (this.hpoTermsDetected && this.hpo_radios === "all_sources_terms")){
            hpoPhenotypes.map(hpo => {
              var idx = hpoPhenotypes.indexOf(hpo);
              if(!hpoAddedTerms.includes(this.HpoReviewTerms[idx].phenotype)){
                this.hpoTermsAdded_temp.push(this.HpoReviewTerms[idx])
                hpoAddedTerms.push(this.HpoReviewTerms[idx].phenotype)
              }
            })
          }
          else{
            //When only inputted hpo terms are selected
            hpoPhenotypes.map(hpo => {
              var idx = hpoPhenotypes.indexOf(hpo);
              if(!hpoAddedTerms.includes(this.HpoReviewTerms[idx].phenotype)){
                if(this.hpoExtractedPhenotypesFromIds.includes(hpo)){
                  this.hpoTermsAdded_temp.push(this.HpoReviewTerms[idx])
                  hpoAddedTerms.push(this.HpoReviewTerms[idx].phenotype)
                }
              }
            }) 
          }
        }
        
        
        //Normal condiiton:
        this.basicModeTermsAdded_temp.map((term, index) => {
          if(!this.hpoTermsDetected || (this.hpoTermsDetected && this.hpo_radios === "all_sources_terms")) {
            if(term.reviewTerms_gtr.length){
              this.GtrTermsAdded_temp.push(term.reviewTerms_gtr[0]);
            }
            if(term.reviewTerms_phenolyzer.length){
              this.phenolyzerTermsAdded_temp.push(term.reviewTerms_phenolyzer[0]);
            }
            var item = term.DiseaseName.replace(/-/g, " ").replace(/\s\s+/g, ' ').toLowerCase().replace("disease", "").replace("syndrome", "").trim();
            hpoPhenotypes.map(hpo => {
              var idx = hpoPhenotypes.indexOf(hpo);
              if(!hpoAddedTerms.includes(this.HpoReviewTerms[idx].phenotype)){
                this.hpoTermsAdded_temp.push(this.HpoReviewTerms[idx])
                term.HpoTermSelected = this.HpoReviewTerms[idx]
                hpoAddedTerms.push(this.HpoReviewTerms[idx].phenotype)
              }
            })
            //Also attach the selected terms from each tool to the basicModeTermsAdded_temp
            if(term.reviewTerms_gtr.length){
              term.GtrTermSelected = term.reviewTerms_gtr[0];
            }
            else{
              term.GtrTermSelected = {
                ConceptID: "",
                DiseaseName: term.DiseaseName
              }
            }

            term.PhenolyzerTermSelected = term.reviewTerms_phenolyzer[0];

          }
          else {
            //When only inputted hpo terms are selected
            hpoPhenotypes.map(hpo => {
              var idx = hpoPhenotypes.indexOf(hpo);
              if(!hpoAddedTerms.includes(this.HpoReviewTerms[idx].phenotype)){
                if(this.hpoExtractedPhenotypesFromIds.includes(hpo)){
                  this.hpoTermsAdded_temp.push(this.HpoReviewTerms[idx])
                  hpoAddedTerms.push(this.HpoReviewTerms[idx].phenotype)
                }
              }
            }) 
          }
        })
        this.potentialGtrTermsCount = 0; 
        this.potentialPhenolyzerTermsCount = 0;
        this.basicModeTermsAdded_temp.map( term => {
          this.potentialGtrTermsCount = this.potentialGtrTermsCount + term.reviewTerms_gtr.length; 
          this.potentialPhenolyzerTermsCount = this.potentialPhenolyzerTermsCount + term.reviewTerms_phenolyzer.length
        })

        this.loadingDialog = false;
        this.termsReviewDialog = true;
        this.termsReviewDialogPage = 0;

      },
      
      drawHistogram() {
        d3.select(".hpo-histogram").select("svg").remove();

      var margin = { top: 20, right: 20, bottom: 100, left: 60 };
      var height = 300;
      var width = 400;

      var color = "rgb(37 157 241)";
      const svg = d3
        .select(".hpo-histogram")
        .append("svg")
        .attr("width", 400)
        .attr("height", 300);

      var data = this.scaledHpoScores;

      var bins = d3.bin().thresholds(6)(data);
      console.log("bins", bins);

      var xAxis = (g) =>
        g
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(
            d3
              .axisBottom(this.x)
              .ticks(4)
              .tickSizeOuter(0)
          )
          .call((g) =>
            g.selectAll(".domain").attr("stroke-width", 0.3).attr("stroke", "#606060")
          )
          .call((g) =>
            g.selectAll("line").attr("stroke-width", 0.3).attr("stroke", "#606060")
          )
          .call((g) => g.selectAll("text").attr("fill", "#606060"))
          .call((g) =>
            g
              .append("text")
              .attr("x", width/2)
              .attr("y", 33)
              .attr("fill", "currentColor")
              .attr("text-anchor", "end")
              .attr("font-weight", "500")
              .attr("font-size", "13px")
              .attr("font-family", "Roboto, sans-serif")
              .text("score")
          );

      var yAxis = (g) =>
        g
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y).ticks(4))
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g.selectAll("line").attr("stroke-width", 0.3).attr("stroke", "#606060")
          )
          .call((g) => g.selectAll("text").attr("fill", "#606060"))
          .call((g) =>
            g
              .select(".tick:last-of-type text")
              .clone()
              .attr("x", 105)
              .attr("y", 42)
              .attr("text-anchor", "start")
              .attr("text-anchor", "end")
              .attr("font-weight", "500")
              .attr("font-size", "13px")
              .attr("font-family", "Roboto, sans-serif")
              .text("Genes")
              .attr("transform", "rotate(90)")
          );

      this.x = d3
        .scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([margin.left, width - margin.right]);

      var y = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .range([height - margin.bottom, margin.top]);

      svg
        .append("g")
        .attr("fill", color)
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", (d) => {
          return this.x(d.x0) + 1;
        })
        .attr("width", (d) => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
        .attr("y", (d) => y(d.length))
        .attr("height", (d) => y(0) - y(d.length));

      svg.append("g").call(xAxis);

      svg.append("g").call(yAxis);
      
      svg.call(
        d3
          .brushX() // Add the brush feature using the d3.brush function
          .extent([
            [margin.left, margin.top],
            [width - margin.right, height - margin.bottom],
          ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
          .on("start end", this.brsuhHistogram)
      );
    },
    brsuhHistogram(event) {
      var extent = event.selection;

      var newInput = [];
      var brushArea = event.selection;
      if(brushArea == null){
        bus.$emit("filterOnSpecificityScore", true)
        bus.$emit("hpoScaledScoreRange", [0, 0])
      }
      else {
        var [x0, x1] = event.selection.map(this.x.invert);
        bus.$emit("filterOnSpecificityScore", true)
        bus.$emit("hpoScaledScoreRange", [x0.toFixed(4), x1.toFixed(4)])
      }
    },

  }
};

var xScale2 = null;
var rects = null;
var x = null;
var y = null;
var yScale2 = null;


function drawHpoGenesBarChart(menu) {
  // select the svg container first
  
  d3.select(".hpo-genes-bar-chart").select("svg").remove();

  const svg = d3
    .select(".hpo-genes-bar-chart")
    .append("svg")
    .attr("width", 400)
    .attr("height", 300);

  // create margins & dimensions
  const margin = { top: 20, right: 20, bottom: 100, left: 60 };
  const graphHeight = 400 - margin.left - margin.right;
  const graphWidth = 300 - margin.top - margin.bottom;

  const graph = svg
    .append("g")
    .attr("width", graphHeight)
    .attr("height", graphWidth)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // create axes groups
    const xAxisGroup = graph
      .append("g")
      .attr("transform", `translate(0, ${graphWidth})`);

  const yAxisGroup = graph.append("g");

  // d3.json("menu.json").then((data) => {
  // const y = d3
  //   .scaleLinear()
  //   .domain([0, d3.max(menu, (d) => d.count)])
  //   .range([graphHeight, 0]);
    
  x = d3
    .scaleLinear()
    .domain([0, d3.max(menu, (d) => d.count)])
    .range([0, graphHeight]);  
    
  y = d3
    .scaleBand()
    .domain(menu.map((item) => item.name))
    .range([graphWidth, 0])
    .paddingInner(0.2)
    .paddingOuter(0.2);
    
  yScale2 = d3
    .scaleBand()
    .domain(menu.map((item) => item.name))
    .range([graphWidth, 0])
    .paddingInner(0.2)
    .paddingOuter(0.2);  

  // x = d3
  //   .scaleBand()
  //   .domain(menu.map((item) => item.name))
  //   .range([0, graphWidth])
  //   .paddingInner(0.2)
  //   .paddingOuter(0.2);
  // 
  xScale2 = d3
    .scaleBand()
    .domain(menu.map((item) => item.name))
    .range([0, graphWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);

  // join the data to circs
  const rects = graph.selectAll("rect").data(menu);


  // append the enter selection to the DOM
  // rects
  //   .enter()
  //   .append("rect")
  //   .attr("width", x.bandwidth)
  //   .attr("height", (d) => graphHeight - y(d.count))
  //   .attr("fill", "orange")
  //   .attr("class", "rects")
  //   .attr("x", (d) => x(d.name))
  //   .attr("y", (d) => y(d.count));
  
  rects
    .enter()
    .append("rect")
    .attr("height", y.bandwidth)
    .attr("width", (d) => {
      return x(d.count);
    })
    .attr("fill", "rgb(37 157 241)")
    .attr("class", "rects")
    .attr("y", (d) => y(d.name))
    .attr("x", (d) => {
      return 0;
    });

  // console.log(this.x.invert(150));

  // create & call axesit
  const xAxis = d3.axisBottom(x).ticks(4);
  const yAxis = d3
    .axisLeft(y)
    .ticks(3);

  xAxisGroup.call(xAxis)
    .call((g) =>
      g.selectAll(".domain").attr("stroke-width", 0.3).attr("stroke", "#606060")
    )
    .call((g) =>
      g.selectAll("line").attr("stroke-width", 0.3).attr("stroke", "#606060")
    )
    .call((g) => g.selectAll("text").attr("fill", "#606060"))
    .call((g) => {
      g.append("text")
      .attr("x", margin.right + 140)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .attr("font-weight", "500")
      .attr("font-size", "13px")
      .attr("font-family", "Roboto, sans-serif")
      .text("Genes");
    });
  
  
  yAxisGroup.call(yAxis)
    .call((g) =>
      g.selectAll("line").attr("stroke-width", 0.3).attr("stroke", "#606060")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").attr("fill", "#606060"))
    .call((g) => {
      g.append("text")
      .attr("x", margin.right + 120)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("font-weight", "500")
      .attr("font-size", "13px")
      .attr("font-family", "Roboto, sans-serif")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(90)")
      .text("Search terms");
    })
    .call((g) =>
      g.selectAll(".domain").attr("stroke-width", 0.3).attr("stroke", "#606060")
    );

  xAxisGroup
    .selectAll("text")
    .attr("text-anchor", "end");
  // });

  graph.call(
    d3
      .brushY() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [graphHeight, graphWidth],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("start end", brushing)
  );
}

function brushing(event) {
  var extent = event.selection;

  var newInput = [];
  var brushArea = event.selection;

  if (brushArea === null) brushArea = y.range();

  yScale2.domain().forEach((d) => {
    var pos = yScale2(d) + yScale2.bandwidth() / 2;
    if (pos >= brushArea[0] && pos <= brushArea[1]) {
      newInput.push(d);
    }
  });
  
  d3.selectAll(".rects").attr("fill", (d) => {
    if (d.name !== undefined) {
      var val = d.name;
      var pos = yScale2(val) + yScale2.bandwidth() / 2;
      if (pos >= brushArea[0] && pos <= brushArea[1]) {
        return "rgb(62 146 204)";
      } else {
        return "rgb(37 157 241)";
      }
    }
  });

  bus.$emit("filterOnGenesOverlap", true);
  bus.$emit("hpoSelectionRange", [newInput[0], newInput[newInput.length - 1]]);

  var left = yScale2(d3.min(newInput));
  var right = yScale2(d3.max(newInput)) + yScale2.bandwidth();
  var top = null;
  var bottom = null;

  if (left > right) {
    top = right;
    bottom = left;
  } else {
    top = left;
    bottom = right;
  }

  if (newInput.length > 1) {
    top = top - yScale2.bandwidth();
    bottom = bottom + yScale2.bandwidth();
  }

  if (event.sourceEvent) {
    d3.select(this).transition().call(event.target.move, [top, bottom]);
  }
}

</script>


<style lang="sass">
  @import url('https://fonts.googleapis.com/css?family=Poppins&display=swap')

  body, .v-application
    font-family: 'Poppins', sans-serif

  .v-application--wrap
    font-family: 'Poppins', sans-serif

  .v-btn
    text-transform: none !important

  #single_entry_input
      font-size: 14px
      color: rgba(0, 0, 0, 0.6)

  #single_entry_input_textarea
      font-size: 14px
      color: rgba(0, 0, 0, 0.6)

  // #single_entry_input
  //   width: 1400px
  //   height: 49px
  //   margin-top: 7px
  //   // border: 0
  //   border: 1px solid #bab3b3
  //   // box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)
  //   border-radius: 4px
  //   font-size: 14px
  //   color: rgba(0, 0, 0, 0.6)
  //
  // #single_entry_input:focus
  //   outline: 1px solid #45688E

  // #single_entry_input_textarea
  //   width: 1390px
  //   margin-top: 7px
  //   font-size: 14px
  //   color: rgba(0, 0, 0, 0.6)

  .reviewCard
    min-height: 80px
    max-height: 250px
    margin-bottom: -15px
    overflow-y: auto

  .open>.dropdown-menu
    padding-left: 0px !important
    margin-top: -30px !important

  .dropdown-menu>.active>a
    background-color: #45688e

  // .v-chip__close.v-icon.v-icon--right
  //   color: white !important

  .terms_delete_btn
    font-size: 16px !important
    cursor: pointer
    opacity: 0.8

  .search_status_tbody
    display: block
    max-height: 170px
    overflow-y: scroll

  .i-text--left
    text-align: left
  
  .i-terms-spacing
    width: 200px !important  
    
  .i-icon--spacing
    width: 40px !important

  .i-clinical_note_text_div
    display: block
    max-height: 252px
    // min-height: 104px
    overflow-y: scroll
    
  .i-clinical_note_viz_div
    display: block
    max-height: 252px
    // min-height: 104px
    // overflow-y: scroll  

  .i-note_and_terms_row
    display: flex

  .i-note_and_terms_col
    flex: 1


  .row-flex
    display: flex

  .col-flex-note
    flex: 3
    margin-top: 12px
    margin-bottom: 12px
    margin-left: 12px
    margin-right: 6px

  .col-flex-terms
    flex: 2
    margin-top: 12px
    margin-bottom: 12px
    margin-left: 6px
    margin-right: 12px

  .col-container
    display: flex

  .badge-label
    font-size: 16px
    color: #434343
    font-weight: 400

  .terms-heading
    color: #434343
    font-size: 16px
    display: flex
    padding-left: 0px
    margin-left: 0px
    min-width: 170px
    justify-content: flex-start
    padding-top: 5px
    padding-bottom: 5px
    align-items: center
    
  .hpo-terms-detected-card
    .v-label
      font-size: 14px !important
      font-weight: 500
      padding-top: 4px


.close-margin-left-40
  margin-left: -40px
  
.close-margin-left-20
  margin-left: -20px  


</style>

<style>.cls-1{fill:none;stroke:#455a64;stroke-miterlimit:10;}.cls-2{font-size:10.47px;fill:#455a64;font-family:Raleway-Bold, Raleway;font-weight:700;letter-spacing:-0.03em;}</style>
