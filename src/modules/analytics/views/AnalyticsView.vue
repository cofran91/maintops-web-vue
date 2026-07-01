<script setup>
import { mdiChartLine, mdiRefresh } from '@mdi/js'
import { useI18n } from 'vue-i18n'
import { useAnalyticsOverview } from '@/modules/analytics/composables/useAnalyticsOverview.js'
import AnalyticsFilters from '@/modules/analytics/components/AnalyticsFilters.vue'
import AnalyticsSummaryCards from '@/modules/analytics/components/AnalyticsSummaryCards.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import RecommendationsPanel from '@/modules/analytics/components/RecommendationsPanel.vue'
import RiskAlertsPanel from '@/modules/analytics/components/RiskAlertsPanel.vue'
import TechnicianEfficiencyPanel from '@/modules/analytics/components/TechnicianEfficiencyPanel.vue'
import WorkloadForecastPanel from '@/modules/analytics/components/WorkloadForecastPanel.vue'
import WorkshopBottlenecksPanel from '@/modules/analytics/components/WorkshopBottlenecksPanel.vue'

const { t } = useI18n()
const {
  alerts,
  analyticsEnabled,
  canEditWorkshopFilter,
  canUseAnalytics,
  errorMessage,
  fetchAnalytics,
  filters,
  forecasts,
  loading,
  observedSample,
  overview,
  recommendations,
  resetFilters,
  setFilter,
  technicianMetrics,
  workshopMetrics,
} = useAnalyticsOverview()

const applyFilters = () => {
  void fetchAnalytics()
}
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('analytics.page.title')"
      :subtitle="t('analytics.page.subtitle')"
      :eyebrow="t('analytics.page.eyebrow')"
      :icon="mdiChartLine"
    >
      <template #actions>
        <BaseButton
          color="info"
          :icon="mdiRefresh"
          :label="t('common.actions.refresh')"
          :disabled="loading || !analyticsEnabled || !canUseAnalytics"
          @click="fetchAnalytics"
        />
      </template>

      <AppEmptyState
        v-if="!canUseAnalytics"
        :title="t('analytics.page.restrictedTitle')"
        :description="t('analytics.page.restrictedDescription')"
      />

      <AppEmptyState
        v-else-if="!analyticsEnabled"
        :title="t('analytics.page.unavailableTitle')"
        :description="t('analytics.page.unavailableDescription')"
      />

      <template v-else>
        <AnalyticsFilters
          :filters="filters"
          :loading="loading"
          :can-edit-workshop-filter="canEditWorkshopFilter"
          @apply="applyFilters"
          @reset="resetFilters"
          @update-filter="setFilter"
        />

        <NotificationBar v-if="errorMessage" color="danger">
          {{ errorMessage }}
        </NotificationBar>

        <NotificationBar v-if="loading" color="info">
          {{ t('analytics.states.loading') }}
        </NotificationBar>

        <div v-if="overview" class="space-y-6">
          <AnalyticsSummaryCards
            :overview="overview"
            :observed-sample="observedSample"
            :forecasts="forecasts"
          />

          <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TechnicianEfficiencyPanel
              :metrics="technicianMetrics"
              :scope="overview.technicianEfficiency.scope"
            />
            <WorkshopBottlenecksPanel
              :metrics="workshopMetrics"
              :scope="overview.workshopBottlenecks.scope"
            />
          </section>

          <WorkloadForecastPanel
            :forecasts="forecasts"
            :algorithm-version="overview.workloadForecast.algorithm_version"
          />

          <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RiskAlertsPanel :alerts="alerts" />
            <RecommendationsPanel :recommendations="recommendations" />
          </section>
        </div>
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>
