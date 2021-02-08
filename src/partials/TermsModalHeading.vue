<template>
  <div class="mb-5 text-center" style="margin-right: 125px">
    <strong class="primary--text" style="font-size: 18px">{{ heading }}</strong>
    <br>
    <div class="mt-2">
      <span><h1 style="display:inline"> {{ selectedTerms }}</h1> </span> <span>terms selected</span>
    </div>
    <div class="mt-2 mb-2" style="color:#ababab">
      <span> <h3 style="display:inline;font-size: 18px;">{{ potentialTerms }}</h3> </span>
      <span> potential terms</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'TermsModalHeading',
    props: {
      heading: '',
      selectedTerms: 0,
      potentialTerms: 0
    },
    data (){
      return {
        loading: true,
        transition: 'scale-transition',
      }
    }
  }
</script>
