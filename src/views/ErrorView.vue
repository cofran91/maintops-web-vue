<script setup>
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="dark">
      <CardBox :class="cardClass">
        <div class="space-y-3">
          <h1 class="text-2xl">{{ t('errorPage.title') }}</h1>
          <p>{{ t('errorPage.description') }}</p>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton :label="t('common.actions.backToDashboard')" to="/dashboard" color="info" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
