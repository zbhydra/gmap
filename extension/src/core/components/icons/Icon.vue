<template>
  <svg
    class="icon"
    :class="`icon--${size}`"
    viewBox="0 0 24 24"
    aria-hidden="true"
    v-html="iconPaths[name]"
  />
</template>

<script setup lang="ts">
import { IconName, IconSize } from './iconTypes'
import { iconPaths } from './iconPaths'

withDefaults(defineProps<{ name: IconName; size?: IconSize }>(), {
  size: IconSize.MD
})
</script>
