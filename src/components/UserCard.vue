<script setup>
import { computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiCheckDecagram } from '@mdi/js'
import BaseLevel from '@/components/BaseLevel.vue'
import UserAvatarCurrentUser from '@/components/UserAvatarCurrentUser.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import PillTag from '@/components/PillTag.vue'
import { useI18n } from 'vue-i18n'

const mainStore = useMainStore()
const { t } = useI18n()

const userName = computed(() => mainStore.userName)

const userSwitchVal = ref(false)
</script>

<template>
  <CardBox>
    <BaseLevel type="justify-around lg:justify-center">
      <UserAvatarCurrentUser class="lg:mx-12" />
      <div class="space-y-3 text-center md:text-left lg:mx-12">
        <div class="flex justify-center md:block">
          <FormCheckRadio
            v-model="userSwitchVal"
            name="notifications-switch"
            type="switch"
            :label="t('userCard.notifications')"
            :input-value="true"
          />
        </div>
        <h1 class="text-2xl">
          {{ t('userCard.greeting', { name: userName }) }}
        </h1>
        <p>{{ t('userCard.lastLoginFrom', { time: '12 mins ago', ip: '127.0.0.1' }) }}</p>
        <div class="flex justify-center md:block">
          <PillTag :label="t('userCard.verified')" color="info" :icon="mdiCheckDecagram" />
        </div>
      </div>
    </BaseLevel>
  </CardBox>
</template>
