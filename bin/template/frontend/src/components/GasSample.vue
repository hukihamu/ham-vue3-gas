<script setup lang="ts">
import {ref} from 'vue'
import {scripts} from '@/scripts'

const text = ref('')
function onRequest() {
  scripts.send('gasSample').then(it => {
    text.value = it
  })
}
</script>

<template>
  <v-row justify="center" class="pt-4">
    <v-btn @click="onRequest" text="gasへリクエスト"/>
  </v-row>
  <v-row justify="center">
    <span>{{text}}</span>
  </v-row>
</template>

<style scoped>

</style>