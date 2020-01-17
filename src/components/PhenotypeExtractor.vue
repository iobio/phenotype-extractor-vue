<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      <div class="row">
        <div class="col-md-12">
          <div class="mr-2" id="SingleEntryInput" style="display:inline-block; padding-top:5px; margin-bottom:-30px">
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
                v-show="textNotes.length>=45"
                v-model="textNotes"
                ref="single_entry_input_textarea"
                id="single_entry_input_textarea"
                name="input-7-4"
                rows="2"
                outlined
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
          <div mt-0 v-if="multipleSearchTerms.length && !searchStatusDialog && !showSearchTermsLoader">
            <!-- <v-btn style="text-transform:none" small @click="DuplicateSearchStatusDialog=true">
             Show search status
            </v-btn> -->
          </div>
        </div>
        <div class="col-md-5">
          <v-card>
            <v-card-title primary-title>
              <span style="font-size:16px">
                Notes added
                <v-badge
                  :value="clinical_note_text.length"
                  color="primary"
                  left
                  class="ml-7 mb-2"
                >
                  <span slot="badge">{{ clinical_note_text.length }}</span>
                </v-badge>
              </span>
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
                  <blockquote v-for="(note, i) in clinical_note_text" :key="i" class="blockquote i-text--left" style="font-size: 13px;">
                    {{ note }}
                  </blockquote>
                </div>
                <div v-else>
                  <blockquote class="blockquote i-text--left" style="font-size: 14px;">
                    No clinical is note added.
                  </blockquote>
                </div>
              </div>
            </v-card-text>
          </v-card>
          <!-- <v-expansion-panels
            v-model="clinical_note_text_expansion_panel"
            class=""
            multiple>
            <v-expansion-panel>
              <v-expansion-panel-header>
                Notes added
                <v-badge
                  :value="clinical_note_text.length"
                  color="primary"
                  left
                  class="ml-7"
                >
                  <span slot="badge">{{ clinical_note_text.length }}</span>
                </v-badge>

              </v-expansion-panel-header>
              <v-expansion-panel-content class="i-clinical_note_text_div">

              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels> -->

        </div>
        <div class="col-md-7">
          <!-- <v-expansion-panels
            v-model="search_status_expansion_panel"
            multiple :readonly="readonly">
            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="none">
                <div class="row">
                  <div class="col-md-9">
                    Search status
                  </div>
                  <div class="col-md-3">
                    <v-btn small >Gene overlap</v-btn>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class=""> -->
              <v-card>
                <v-card-title primary-title>
                  <span style="font-size:16px">Search status</span>
                  <v-spacer></v-spacer>
                    <!-- <v-btn small @click="toggle_gene_overlap_button" style="text-transform:none">
                      <span style="text-transform:none">Genes overlap</span>
                      <v-icon v-if="!genesOverlap">expand_more</v-icon>
                      <v-icon v-if="genesOverlap">expand_less</v-icon>
                    </v-btn> -->
                </v-card-title>
                <v-card-text>
                  <div class="" style="padding-bottom: 0px; ">
                    <div class="row">
                      <div class="col-md-4">
                        <table class="table">
                          <thead>
                            <tr class="i-text--left">
                              <strong>GTR</strong>
                              <span v-if="Gtr_searchTermsObj.length && !showSearchTermsLoader">
                                <v-badge
                                  :value="Gtr_searchTermsObj.length"
                                  color="primary"
                                  left
                                  class="ml-8 mb-2"
                                >
                                  <span slot="badge">{{ Gtr_searchTermsObj.length }}</span>
                                </v-badge>
                              </span>
                            </tr>
                          </thead>
                          <tbody class="search_status_tbody">
                            <tr v-if="showSearchTermsLoader">
                              <v-skeleton-loader
                                :loading="loading"
                                :transition="transition"
                                type="chip"
                                class="mt-2"
                              >
                              </v-skeleton-loader>
                            </tr>
                            <tr v-if="!showSearchTermsLoader && Gtr_searchTermsObj.length" v-for="(term, i) in Gtr_searchTermsObj" :key="i">
                              <td class="i-text--left">
                                <div @mouseover="mouseOverGtrTerm(term.DiseaseName)" @mouseleave="hovered_gtr_term=''">
                                  <span>{{ term.DiseaseName }}</span>
                                  <span v-if="hovered_gtr_term === term.DiseaseName"><v-icon class="ml-1 terms_delete_btn" color="red lighten-2" @click="remove(term, i, 'GTR')">cancel</v-icon></span>
                                </div>
                              </td>
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
                        <div class="i-text--left" v-if="Gtr_searchTermsObj.length<1">
                          <span v-if="!showSearchTermsLoader"><i>Not Selected...</i></span>
                        </div>
                      </div>

                      <div class="col-md-4">
                        <table class="table">
                          <thead>
                            <tr class="i-text--left">
                              <strong>Phenolyzer</strong>
                              <span class="ml-2" v-if="Phenolyzer_searchTermsObj.length && !showSearchTermsLoader">
                                <v-badge
                                  :value="Phenolyzer_searchTermsObj.length"
                                  color="primary"
                                  left
                                  class="ml-6 mb-2"
                                >
                                  <span slot="badge">{{ Phenolyzer_searchTermsObj.length }}</span>
                                </v-badge>
                              </span>
                              <div v-if="Phenolyzer_searchTermsObj.length>0">
                              </div>
                            </tr>
                          </thead>
                          <tbody class="search_status_tbody">
                            <tr v-if="showSearchTermsLoader">
                              <v-skeleton-loader
                                :loading="loading"
                                :transition="transition"
                                type="chip"
                                class="mt-2"
                              >
                              </v-skeleton-loader>
                            </tr>
                            <tr v-if="!showSearchTermsLoader" v-for="(term, i) in Phenolyzer_searchTermsObj" :key="i">
                              <td class="i-text--left" @mouseover="mouseOverPhenolyzerTerm(term.value)" @mouseleave="hovered_phenolyzer_term=''">
                                <span>{{ term.value | to-firstCharacterUppercase }}</span>
                                <span v-if="hovered_phenolyzer_term === term.value">
                                  <v-icon class="ml-1 terms_delete_btn" color="red lighten-2" @click="remove(term, i, 'phenolyzer')">cancel</v-icon>
                                </span>
                              </td>
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
                        <div class="i-text--left" v-if="Phenolyzer_searchTermsObj.length<1">
                          <span v-if="!showSearchTermsLoader"><i>Not Selected...</i></span>
                        </div>
                      </div>

                      <div class="col-md-4">
                        <table class="table">
                          <thead>
                            <tr class="i-text--left">
                              <strong>HPO</strong>
                              <span class="ml-2" v-if="Hpo_searchTermsObj.length && !showSearchTermsLoader">
                                <v-badge
                                  :value="Phenolyzer_searchTermsObj.length"
                                  color="primary"
                                  left
                                  class="ml-6 mb-2"
                                >
                                  <span slot="badge">{{ Phenolyzer_searchTermsObj.length }}</span>
                                </v-badge>
                              </span>
                            </tr>
                          </thead>
                          <tbody class="search_status_tbody">
                            <tr v-if="showSearchTermsLoader">
                              <v-skeleton-loader
                                :loading="loading"
                                :transition="transition"
                                type="chip"
                                class="mt-2"
                              >
                              </v-skeleton-loader>
                            </tr>
                            <tr v-if="!showSearchTermsLoader" v-for="(term, i) in Hpo_searchTermsObj" :key="i">
                              <td class="i-text--left" @mouseover="mouseOverHpoTerm(term.HPO_Data)" @mouseleave="hovered_hpo_term=''">
                                <span>{{ term.HPO_Data }}</span>
                                <span v-if="hovered_hpo_term === term.HPO_Data">
                                  <v-icon class="ml-1 terms_delete_btn" color="red lighten-2" @click="remove(term, i, 'HPO')">cancel</v-icon>
                                </span>
                              </td>
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
                        <div class="i-text--left" v-if="Hpo_searchTermsObj.length<1">
                          <span v-if="!showSearchTermsLoader"><i>Not Selected...</i></span>
                        </div>
                      </div>

                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels> -->

          <!-- venn diagram -->
          <!-- <VennDiagram
            class="mt-2"
            :vennData="venn_diagram_data"
            ref="genesOverlap"
            id="genesOverlap"
            style="height:0; visibility: hidden"
            >
          </VennDiagram> -->
        </div>
      </div>


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
            max-width="1000px"
            transition="dialog-transition"
          >
            <v-card>
              <v-card-title class="grey lighten-2">
                <div v-if="termsReviewDialogPage===1">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">sort</v-icon> GTR (Genetic Testing Registry)
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===2">
                  <div class="pa-2">
                    <img src="../assets/phenolyzer1.svg" alt="" height="28px" width="28px" > Phenolyzer
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===3">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">speaker_notes</v-icon> HPO (Human Phenotype Ontology)
                  </div>
                </div>
                <div v-if="termsReviewDialogPage===4">
                  <div class="pa-2">
                    <v-icon color="primary darken-1">rate_review</v-icon> Review selected terms:
                  </div>
                </div>


                <v-spacer></v-spacer>
                <span>
                  <v-btn text icon @click="closeReviewDialog"><v-icon>close</v-icon></v-btn>
                </span>

              </v-card-title>

              <v-card-title>
                <div  class="mt-1 mb-1" v-if="GtrReviewTerms.length && termsReviewDialogPage===1">
                  <div v-if="GtrTermsAdded_temp.length>0">
                    <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                    <span v-for="(term, i) in GtrTermsAdded" v-if="GtrTermsAdded.length">
                      <!-- <v-chip class="mr-2" small outlined color="primary">
                        {{ term.DiseaseName }}
                      </v-chip> -->
                    </span>
                    <span v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                      <v-chip class="mr-2" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'GTR')">
                        {{ term.DiseaseName }}
                      </v-chip>
                    </span>
                  </div>
                  <div v-else>
                    <center>
                      <v-alert
                        v-model="expansion_hint_alert"
                        dismissible
                        color="cyan"
                        border="left"
                        elevation="2"
                        colored-border
                        icon="rate_review"
                        class="ml-10 mb-2"
                      >
                        <small> Review and select terms to be searched in each of the following tools: GTR, Phenolyzer, HPO.</small>
                      </v-alert>
                    </center>
                  </div>
                </div>

                <div class="mt-1 mb-1" v-if="phenolyzerReviewTerms.length && termsReviewDialogPage===2">
                  <div v-if="phenolyzerTermsAdded_temp.length>0">
                    <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                    <!-- <span v-for="(term, i) in phenolyzerTermsAdded" v-if="phenolyzerTermsAdded.length">
                      <v-chip class="mr-2" small outlined color="primary">
                        {{ term.value }}
                      </v-chip>
                    </span> -->
                    <span v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                      <v-chip class="mr-2" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'Phenolyzer')">
                        {{ term.value }}
                      </v-chip>
                    </span>
                  </div>
                </div>

                <div class="mt-1 mb-1" v-if="HpoReviewTerms.length && termsReviewDialogPage===3">
                  <div v-if="hpoTermsAdded_temp.length>0">
                    <small  style="color: rgba(0, 0, 0, 0.6); font-size: 0.875rem" class="font-weight-thin">Terms Selected: </small>
                    <!-- <span v-for="(term, i) in hpoTermsAdded" v-if="hpoTermsAdded.length">
                      <v-chip class="mr-2" small outlined color="primary">
                        {{ term.HPO_Data }}
                      </v-chip>
                    </span> -->
                    <span v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                      <v-chip class="mr-2" small outlined color="primary" close :key="i" @click:close="removeReviewTerms(term, i, 'HPO')">
                        {{ term.HPO_Data }}
                      </v-chip>
                    </span>
                  </div>
                </div>

              </v-card-title>
              <v-card-text style="height: 430px;">

                <!-- GTR review terms table -->
                <div v-if="GtrReviewTerms.length && termsReviewDialogPage===1">
                  <div v-if="GtrReviewTerms.length===1">
                    <div >
                      <v-expansion-panels v-model="gtr_terms_expansion_panel" multiple popout focusable :readonly="readonly">
                        <v-expansion-panel v-for="(item, i) in GtrReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_gtr[0].general">
                              <div class="row">
                                <div class="col-md-1">
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="GtrTermsAdded_temp" :value="item.reviewTerms_gtr[0]"></v-checkbox>
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.reviewTerms_gtr[0].DiseaseName}}</strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'GTR')">
                                  <span><small>{{item.reviewTerms_gtr.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-1">
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.DiseaseName }} </strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'GTR')">
                                  <span><small>{{item.reviewTerms_gtr.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
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
                      <v-expansion-panels v-model="gtr_terms_expansion_panel" multiple popout focusable :readonly="readonly">
                        <v-expansion-panel v-for="(item, i) in GtrReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_gtr[0].general">
                              <div class="row">
                                <div class="col-md-1">
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="GtrTermsAdded_temp" :value="item.reviewTerms_gtr[0]"></v-checkbox>
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.reviewTerms_gtr[0].DiseaseName}}</strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'GTR')">
                                  <span><small>{{item.reviewTerms_gtr.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-1">
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.DiseaseName }} </strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'GTR')">
                                  <span><small>{{item.reviewTerms_gtr.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
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
                  <div v-if="phenolyzerReviewTerms.length===1">
                    <div >
                      <v-expansion-panels v-model="phenolyzer_terms_expansion_panel" multiple popout focusable :readonly="readonly">
                        <v-expansion-panel v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_phenolyzer[0].general">
                              <div class="row">
                                <div class="col-md-1">
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="phenolyzerTermsAdded_temp" :value="item.reviewTerms_phenolyzer[0]"></v-checkbox>
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.reviewTerms_phenolyzer[0].value | to-firstCharacterUppercase}}</strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'Phenolyzer')">
                                  <span><small>{{item.reviewTerms_phenolyzer.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-1">
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.DiseaseName }} </strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'Phenolyzer')">
                                  <span><small>{{item.reviewTerms_gtr.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <div class="reviewCard">
                              <v-card-text >
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
                  <div v-if="phenolyzerReviewTerms.length>1">
                    <div>
                      <v-expansion-panels v-model="phenolyzer_terms_expansion_panel" multiple popout focusable :readonly="readonly">
                        <v-expansion-panel v-for="(item, i) in phenolyzerReviewTerms" :key="i">
                          <v-expansion-panel-header expand-icon="none">
                            <div v-if="item.reviewTerms_phenolyzer[0].general">
                              <div class="row">
                                <div class="col-md-1">
                                  <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="phenolyzerTermsAdded_temp" :value="item.reviewTerms_phenolyzer[0]"></v-checkbox>
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.reviewTerms_phenolyzer[0].value | to-firstCharacterUppercase}}</strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'Phenolyzer')">
                                  <span><small>{{item.reviewTerms_phenolyzer.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <div class="row">
                                <div class="col-md-1">
                                </div>
                                <div class="col-md-8">
                                  <strong> {{ item.DiseaseName }} </strong>
                                </div>
                                <div class="col-md-3" @click="toggle_expansion_panel(i, 'Phenolyzer')">
                                  <span><small>{{item.reviewTerms_gtr.length}} more options</small></span>
                                  <span><v-icon>unfold_more</v-icon></span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-header>
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
                  <v-expansion-panels multiple popout focusable :readonly="readonly">
                    <v-expansion-panel v-for="(term, i) in HpoReviewTerms" :key="i">
                      <v-expansion-panel-header expand-icon="none">
                        <div>
                          <div class="row">
                            <div class="col-md-1">
                              <v-checkbox color="primary" style="margin-top:-6px; margin-bottom:-35px;" v-model="hpoTermsAdded_temp" :value="term"></v-checkbox>
                            </div>
                            <div class="col-md-11">
                              <strong> {{ term.HPO_Data }}</strong>
                            </div>
                          </div>
                        </div>
                      </v-expansion-panel-header>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
                <div v-if="!HpoReviewTerms.length && termsReviewDialogPage===3">
                  Currently unavailable.
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
                                    <v-btn @click="termsReviewDialogPage=2" text small color="primary">edit</v-btn>
                                  </span>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(term, i) in GtrTermsAdded_temp" v-if="GtrTermsAdded_temp.length">
                                  <td> {{ term.DiseaseName }} </td>
                                  <td><v-icon class="terms_delete_btn" @click="removeReviewTerms(term, i, 'GTR')" style="font-size:18px" color="red lighten-2">cancel</v-icon></td>
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
                                    <v-btn @click="termsReviewDialogPage=1" text small color="primary">edit</v-btn>
                                  </span>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(term, i) in phenolyzerTermsAdded_temp" v-if="phenolyzerTermsAdded_temp.length">
                                  <td> {{ term.value }} </td>
                                  <td ><v-icon class="terms_delete_btn" @click="removeReviewTerms(term, i, 'Phenolyzer')" style="font-size:18px" color="red lighten-2">cancel</v-icon></td>
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
                                    <v-btn @click="termsReviewDialogPage=3" text small color="primary">edit</v-btn>
                                  </span>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(term, i) in hpoTermsAdded_temp" v-if="hpoTermsAdded_temp.length">
                                  <td> {{ term.HPO_Data }} </td>
                                  <td ><v-icon class="terms_delete_btn" @click="removeReviewTerms(term, i, 'HPO')" style="font-size:18px" color="red lighten-2">cancel</v-icon></td>
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
              <v-card-actions class="mb-3">
                <div class="flex-grow-1"></div>
                <!-- <v-btn small color="blue darken-1" round outlined dark text @click="termsReviewDialog=false">Skip</v-btn> -->
                <v-btn :disabled="termsReviewDialogPage===1" small color="primary" @click="--termsReviewDialogPage"><v-icon>arrow_left</v-icon> Back</v-btn>
                <v-btn :disabled="termsReviewDialogPage>3" small color="primary" @click="++termsReviewDialogPage"> Next <v-icon>arrow_right</v-icon></v-btn>
                <v-spacer></v-spacer>
                <v-btn :disabled="termsReviewDialogPage!==4" small color="primary" @click="selectReviewTerms">Done</v-btn>
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
            persistent
          >
            <v-card>
              <v-card-title class="grey lighten-2">
                <v-icon class="mr-2" color="primary darken-1">youtube_searched_for</v-icon> Search Status
              </v-card-title>
              <!-- <v-divider></v-divider> -->
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
                            <div v-if="Phenolyzer_searchTermsObj.length>0">
                            </div>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(term, i) in Phenolyzer_searchTermsObj" :key="i">
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
          @venn_diag_summaryObj="venn_diag_summaryObj($event)">
        </SummaryTab>


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
import SkeletonLoadersSearchTerms from './SkeletonLoadersSearchTerms.vue';
import VennDiagram from './VennDiagram.vue'

import Model from '../models/Model';
var model = new Model();


export default {
  name: 'PhenotypeExtractor',
  components: {
    GtrSearch,
    SummaryTab,
    PhenolyzerSearch,
    HpoSearch,
    SkeletonLoadersSearchTerms,
    VennDiagram
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
    }
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
    genesOverlap: false

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
    }

  },

  created(){
    this.venn_diagram_data = this.VennDiagramData;
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
        var time_to_show_skeleton_loader = this.phenotypes[0].length * 3500;
        setTimeout(()=>{
          bus.$emit("hide-gene-table-skeleton-loaders")
        }, time_to_show_skeleton_loader)

        var time_to_show_chips_loaders = this.phenotypes[0].length * 2500;
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
      this.hpoSavedTermsLength = this.phenotypes[1].length;
      this.hpoTermsAdded = this.phenotypes[1];
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
            geneRankPhenolyzer: gene.geneRankPhenolyzer,
            isImportedGenes: gene.isImportedGenes,
            isAssociatedGene: gene.isAssociatedGene
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
      this.gtr_terms_expansion_panel = [];
      this.phenolyzer_terms_expansion_panel = [];
      this.WorkflowStepsflag = false;
      this.LevenshteinResults = [];
      this.loadingDialog = true;
      this.extractedTerms = [];
      this.extractedTermsObj = [];
      this.demoTermsFlag = false;
      // fetch(`http://nv-dev-new.iobio.io/phenotype-extractor/?notes=${this.textNotes}`)
      fetch(`https://backend.iobio.io/phenotypeExtractor?notes=${this.textNotes}`)
        .then(res => res.text())
        .then(text => {
          var res = text.replace('JaroWinkler', '"JaroWinkler"').replace('fuzzyResults', '"fuzzyResults"').replace('LevenshteinResults', '"LevenshteinResults"').replace(/'/g, '"');
          var data = JSON.parse(res);
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
          this.clinical_note_text.unshift(this.textNotes);

          //check this for saving phenotype data
          var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text];
          this.$emit('saveSearchedPhenotypes', allPhenotypes)

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

        // filter duplicate gtr search term suggestions in review dialog
        item.reviewTerms_gtr = item.reviewTerms_gtr.filter((gtr_term, index, self) =>
          index === self.findIndex((t) => (
            t.DiseaseName === gtr_term.DiseaseName
          ))
        )

      })
      setTimeout(()=>{
          this.termsReviewDialog = true;
          this.termsReviewDialogPage = 1;
          this.loadingDialog = false;
      },500)

    },
    selectReviewTerms(){
      if(!this.GtrTermsAdded_temp.length && !this.phenolyzerTermsAdded_temp.leng && !this.hpoTermsAdded_temp.leng){
        this.checkToCloseSearchStatusDialog();
      }

      this.GtrTermsAdded_temp = this.GtrTermsAdded_temp.filter(o1 => this.GtrTermsAdded.every(o2 => {
        return o1.DiseaseName !== o2.DiseaseName
      }));
      this.GtrTermsAdded = [...this.GtrTermsAdded, ...this.GtrTermsAdded_temp];
      // this.$emit("GtrTerms", this.GtrTermsAdded); //Pass back which can be used in phenotypes component .

      this.phenolyzerTermsAdded = [...this.phenolyzerTermsAdded, ...this.phenolyzerTermsAdded_temp];
      this.hpoTermsAdded = [...this.hpoTermsAdded, ...this.hpoTermsAdded_temp];

      this.GtrTermsAdded_temp = [];
      this.phenolyzerTermsAdded_temp = [];
      this.hpoTermsAdded_temp = [];
      // console.log("this.GtrTermsAdded", this.GtrTermsAdded)
      var allPhenotypes = [this.GtrTermsAdded, this.phenolyzerTermsAdded, this.hpoTermsAdded, this.clinical_note_text];
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
      // console.log("this.GtrGenesForSummary", this.items);
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
      this.clinPhenSelectedGenes = genes;
      this.$emit("HpoGeneList", this.clinPhenSelectedGenes)
    },

    hpoIndividualGenes(obj){

    },

    checkToCloseSearchStatusDialog(){
      if(this.gtrFetchCompleted && this.phenolyzerFetchCompleted && this.hpoFetchCompleted){
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

      removeReviewTerms(item, idx, component){
        if(component === 'GTR'){
          this.GtrTermsAdded_temp.splice(idx,1);
          this.GtrTermsAdded_temp = [...this.GtrTermsAdded_temp];
        }
        else if(component === 'Phenolyzer'){
          this.phenolyzerTermsAdded_temp.splice(idx,1);
          this.phenolyzerTermsAdded_temp = [...this.phenolyzerTermsAdded_temp];
        }
        else if(component === 'HPO'){
          this.hpoTermsAdded_temp.splice(idx,1);
          this.hpoTermsAdded_temp = [...this.hpoTermsAdded_temp];
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
      }


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
    text-transform: none !important

  #single_entry_input
    width: 1400px
    height: 49px
    margin-top: 7px
    // border: 0
    border: 1px solid #bab3b3
    // box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)
    border-radius: 4px
    font-size: 14px
    color: rgba(0, 0, 0, 0.6)

  #single_entry_input:focus
    outline: 1px solid #45688E

  #single_entry_input_textarea
    width: 1390px
    margin-top: 7px
    font-size: 14px
    color: rgba(0, 0, 0, 0.6)

  .reviewCard
    height: 250px
    overflow-y: auto

  .open>.dropdown-menu
    padding-left: 0px !important

  .dropdown-menu>.active>a
    background-color: #45688e

  // .v-chip__close.v-icon.v-icon--right
  //   color: white !important

  .terms_delete_btn
    font-size: 18px !important
    cursor: pointer

  .search_status_tbody
    display: block
    max-height: 170px
    overflow-y: scroll

  .i-text--left
    text-align: left

  .i-clinical_note_text_div
    display: block
    max-height: 252px
    min-height: 104px
    overflow-y: scroll

</style>
