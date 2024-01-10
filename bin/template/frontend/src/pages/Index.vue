<script setup lang="ts">
import {ref} from 'vue'
import HelloWorld from '@/components/GasSample.vue'

const {counter} = ref(0)
</script>

<template>
<v-container>
  <v-card class="text-center">
    <v-card-title>Welcome Ham Vue3 Gas</v-card-title>
    <v-card-text>
      <v-row justify="center">
        <v-img src="@/assets/vue.svg" height="300px"/>
      </v-row>
      <v-row justify="center" class="pt-4">
        <v-btn @click="counter++" :text="`count is ${counter}`"></v-btn>
        <v-btn @click="counter = 0" text="reset"></v-btn>
      </v-row>
      <HelloWorld />
    </v-card-text>
  </v-card>
</v-container>
</template>

<style scoped>

</style>