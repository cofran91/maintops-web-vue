<script setup>
import CardBox from '@/components/CardBox.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  emptyTitle: {
    type: String,
    default: 'No records found',
  },
  emptyDescription: {
    type: String,
    default: 'Records will appear here when data is available.',
  },
})

const rowIdentifier = (row) =>
  typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]
</script>

<template>
  <CardBox v-if="rows.length" has-table>
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="rowIdentifier(row)">
          <td v-for="column in columns" :key="column.key" :data-label="column.label">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </CardBox>
  <AppEmptyState v-else :title="emptyTitle" :description="emptyDescription" />
</template>
