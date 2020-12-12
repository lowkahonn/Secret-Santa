<template>
  <div v-if="resource === ''">
    no response
  </div>
  <div v-else>
    {{ resource }}
  </div>
</template>

<script>
import ApiService from '@/api/api.service'
export default {
  name: 'Registration',
  data () {
    return {
      resource: ''
    }
  },
  async mounted () {
    this.resource = await ApiService.register('asd')
  }
}
</script>

<style>

</style>
