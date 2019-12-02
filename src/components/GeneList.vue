<template>
  <v-container>
    <v-layout
      text-center
      row wrap
    >
      <v-flex xs12 sm12 md8 lg8>
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
            :items="GtrGeneList"
            :search="search"
          >
          <template slot="items" slot-scope="props">
            <tr :active="props.selected" :key="props.item.name">
              <td>{{ props.item.key + 1 }}</td>
              <td>
                <span style="font-size:14px; font-weight:600; margin-top:2px; cursor:pointer">{{ props.item.name }}</span>
                <!-- <span style="font-size:14px; font-weight:600; margin-top:2px" slot="activator">{{ props.item.name }}</span> -->
                <span v-if="props.item.isAssociatedGene===true">
                  <v-icon style="font-size:20px" color="blue darken-2">verified_user</v-icon>
                </span>
                <span v-if="props.item.reviewed===true">
                  <v-icon style="font-size:20px" color="green darken-2">rate_review</v-icon>
                </span>
              </td>
              <td> </td>
              <td></td>
              <td></td>
              <td></td>
              <td>
              </td>
              <td>
              </td>

            </tr>
          </template>
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
    gtrGenes: {
      type: Array
    }
  },
  watch:{
    gtrGenes(){
      console.log("gtrGenes changing");
      this.GtrGeneList = this.gtrGenes;
    }
  },
  data () {
    return {
      search: '',
      GtrGeneList: [],
      headers: [
        {
          text: 'Number',
          align: 'left',
          sortable: false,
          value: 'key',
        },
        { text: 'Gene Name', value: 'name', sortable: false, },
        { text: 'Added Gene', value: '', sortable: false, },
        { text: 'HPO', value: '', sortable: false, },
        { text: 'GTR', value: '', sortable: false, },
        { text: 'Phenolyzer', value: '', sortable: false, },
        { text: ' ', align: 'left', sortable: false, value: [] },
        { text: '', align: 'left', sortable: false, value: [] },

      ],
    }
  },

}

</script>
