<template>
  <div>
  <v-card class="mx-auto my-3 blue lighten-5"
    max-width="550" align="left" 
    outlined
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="headline mb-1" v-html="propData.t_title"></v-list-item-title>
        <v-list-item-subtitle class="headline mb-1" v-html="propData.t_title"></v-list-item-subtitle>
       
      </v-list-item-content>
 
      <v-list-item-avatar
        tile
        size="80"
        color="grey"
      ></v-list-item-avatar>
    </v-list-item>
    <v-card-text>
     
            開始日期：<span class="blue--text" v-html="propData.t_startdate"></span>
 </v-card-text>

    <v-card-actions>
      <v-btn text>Button</v-btn>
      <v-btn text>Button</v-btn>
    </v-card-actions>
  </v-card>




  <v-form>
    <v-container>
      <v-row>

        <v-col cols="12" sm="6">
          <v-text-field
            label="Regular"
            single-line
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            label="Solo"
            single-line
            solo
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            label="Filled"
            single-line
            filled
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            label="Outlined"
            single-line
            outlined
          ></v-text-field>
        </v-col>

      </v-row>
    </v-container>
  </v-form>
  </div>
</template>

<script>
export default {
  name: "workdetail",
  props: ["propData"],
  data() {
    return {};
  },
  components: {},
  created() {},
  mounted() {},
  watch: {},
  computed: {},
  methods: {}
};
</script>

<style>
</style>
