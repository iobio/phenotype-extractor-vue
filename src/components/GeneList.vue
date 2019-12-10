<template>
  <v-container>
    <v-layout
      text-center
      row wrap
    >
      <v-flex xs12 sm12 md12 lg12>
        <v-card>
          <v-card-title>
            Gene list
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="summaryGeneList"
            :search="search"
          >
          <template v-slot:item.name="{ item }">
            <v-chip dark>{{ item.name }}</v-chip>
          </template>
          <template v-slot:item.searchTermsPhenolyzer="{ item }">
    				<div v-for="(x, i) in item.searchTermsPhenolyzer">
    					<v-chip class="mb-1 mt-2"> # {{ x.rank}}. {{ x.searchTerm }}</v-chip>
    				</div>
          </template>
          <template v-slot:item.searchTermsGtr="{ item }">
            <div v-for="(x, i) in item.searchTermsGtr">
              <v-chip class="mb-1 mt-2"> # {{ x.rank}}. {{ x.searchTerm }}</v-chip>
            </div>
          </template>
          <template v-slot:item.searchTermHpo="{ item }">
            <div v-for="(x, i) in item.searchTermHpo">
              <v-chip class="mb-1 mt-2"> {{ x.searchTerm }}</v-chip>
            </div>
          </template>

          <!-- <template slot="items" slot-scope="props">
            <tr :key="props.item.name">
              <td>
                <span style="font-size:14px; font-weight:600; margin-top:2px; cursor:pointer" @click="showGeneInfo(props.item)">{{ props.item.name }}</span>
              </td>
              <td>{{ props.item.geneId }} </td>
              <td>
                <div v-for="(x, i) in props.item.searchTermsGtr">
                  <v-chip> {{ x.searchTerm }}</v-chip>
                </div>
              </td>
              <td>
                {{ props.item.searchTermsPhenolyzer }}
              </td>
            </tr>
          </template> -->
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'GeneList',
  components: {
  },
  props: {
    summaryGeneList: {
      type: Array
    }
  },
  watch:{
    summaryGeneList(){
      console.log("gtrGenes changing");
      this.GtrGeneList = this.summaryGeneList;
    }
  },
  data () {
    return {
      search: '',
      GtrGeneList: [],
      headers: [
        { text: 'Gene Name', align: 'left', value: 'name', sortable: false, },
        { text: 'GTR', value: 'searchTermsGtr', sortable: false, },
        { text: 'Phenolyzer', value: 'searchTermsPhenolyzer', sortable: false, },
        { text: 'HPO', value: 'searchTermHpo', sortable: false, },

      ],
    }
  },

  methods: {
    showGeneInfo(gene){
      console.log("gene", gene)
    }
  }

}

</script>

<style lang="sass">
  body, .v-application
    font-family: 'Poppins', sans-serif

  .v-application--wrap
    font-family: 'Poppins', sans-serif

  .v-btn
    text-transform: none

</style>
