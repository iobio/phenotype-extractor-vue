<template>
  <v-container>
    <v-card-text>
      <div class="row">
        <div class="col-md-3">
          <strong style="float:left">GTR Terms: </strong>
          <br>
          <v-skeleton-loader
            :loading="loading"
            :transition="transition"
            type="chip"
          >
          </v-skeleton-loader>
        </div>
        <div class="col-md-3">
          <strong style="float:left">Phenolyzer Terms: </strong>
          <br>
          <v-skeleton-loader
            :loading="loading"
            :transition="transition"
            type="chip"
          >
          </v-skeleton-loader>
        </div>
        <div class="col-md-3">
          <strong style="float:left">HPO Terms: </strong>
          <br>
          <v-skeleton-loader
            :loading="loading"
            :transition="transition"
            type="chip"
          >
          </v-skeleton-loader>
        </div>
        <div class="col-md-3">
          <strong style="float:left">Genes Overview: </strong>
          <br>
          <v-skeleton-loader
            :loading="loading"
            :transition="transition"
            type="image"
            height="90"
          >
          </v-skeleton-loader>
        </div>
      </div>
    </v-card-text>
  </v-container>
</template>

<script>
  export default {
    name: 'SkeletonLoadersSearchTerms',
    data (){
      return {
        loading: true,
        transition: 'scale-transition',
      }
    }
  }
</script>
