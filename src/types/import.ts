export interface ImportRowError {
  row: number
  errors: Record<string, string[]>
}

export interface ImportSummary {
  processed_rows: number
  rows_with_errors: number
  created_records: number
  updated_records: number
  errors: ImportRowError[]
}

export type ImportSummaryFieldKey = Exclude<keyof ImportSummary, 'errors'>

export interface ImportSummaryField {
  key: ImportSummaryFieldKey
  label: string
}
