<script setup>
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="dark">
      <CardBox :class="cardClass">
        <div class="space-y-3">
          <h1 class="text-2xl">Page not found</h1>
          <p>MaintOps Console does not have a view for this address.</p>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton label="Back to dashboard" to="/dashboard" color="info" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
