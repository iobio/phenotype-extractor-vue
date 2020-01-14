<template>
  <div>
    <v-expansion-panels
      v-model="venn_diagram_expansion_panel"
      multiple>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Genes Overview
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div v-show="!vennDiagramLoading">
            <center class="pr-2 pb-2">
              <div id="venn" style="margin-top:-20px; margin-bottom:-20px"></div>
            </center>
          </div>
          <div v-if="vennDiagramLoading">
            <center class="pl-2 pr-2 pb-2">
              <v-skeleton-loader
                :loading="loading"
                :transition="transition"
                type="image"
                height="150"
              >
              </v-skeleton-loader>
            </center>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>


<script>
import { bus } from '../main';

  export default {
    name: 'VennDiagram',

    props: {
      vennData: {
        type: Object
      }
    },

    data: () => ({
      venn_diagram_expansion_panel: [0],
      vennDiagramLoading: false,
      loading: true,
      transition: 'scale-transition',
    }),

    watch: {
      vennData(){
        this.drawVennDiagram();
      }
    },

    created(){
      bus.$on("show-gene-table-skeleton-loaders", ()=>{
        this.vennDiagramLoading = true;
      });

      bus.$on("hide-gene-table-skeleton-loaders", ()=>{
        this.vennDiagramLoading = false;
        this.venn_diagram_expansion_panel = [];
      });

    },

    mounted(){
    },

    updated(){
    },

    methods: {
      drawVennDiagram(){
        d3.select("#venn").select("svg").remove();
        var x = require('venn.js')
        var chart = x.VennDiagram()
                 .width(280)
                 .height(280);
      var div = d3.select("#venn")
      div.datum(this.vennData.data).call(chart);
      var tooltip = d3.select("body").append("div")
          .attr("class", "venntooltip");
      div.selectAll("path")
          .style("stroke-opacity", 0)
          .style("stroke", "#fff")
          .style("stroke-width", 3)
      div.selectAll("g")
          .on("mouseover", function(d, i) {
              // sort all the areas relative to the current item
              x.sortAreas(div, d);
              // Display a tooltip with the current size
              tooltip.transition().duration(400).style("opacity", .9);
              tooltip.text(d.size + " genes");
              // highlight the current path
              var selection = d3.select(this).transition("tooltip").duration(400);
              selection.select("path")
                  .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
                  .style("stroke-opacity", 1)
                  .style("cursor", "pointer");
          })
          .on("mousemove", function() {
              tooltip.style("left", (d3.event.pageX) + "px")
                     .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d, i) {
              tooltip.transition().duration(400).style("opacity", 0);
              var selection = d3.select(this).transition("tooltip").duration(400);
              selection.select("path")
                  .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
                  .style("stroke-opacity", 0);
          })
          .on("click", function(d, i) {
              // sort all the areas relative to the current item
              x.sortAreas(div, d);
              bus.$emit("selectionFromVennDiagram", d);
          });
      }
    },

  }

</script>

<style lang="sass">
  .venntooltip
    position: absolute
    text-align: center
    width: 128px
    height: 26px
    background: #333
    color: #ddd
    padding: 2px
    border: 0px
    border-radius: 8px
    opacity: 0
    z-index: 10


</style>
