/**
 * @typedef {'global' | 'workshop'} AnalyticsScopeType
 * @typedef {'low' | 'medium' | 'high'} AnalyticsConfidenceLevel
 * @typedef {'info' | 'medium' | 'high'} AnalyticsAlertSeverity
 * @typedef {'low' | 'medium' | 'high'} AnalyticsRecommendationPriority
 */

/**
 * @typedef {Object} AnalyticsServiceToken
 * @property {'analytics'} audience
 * @property {string} token
 * @property {string} token_type
 * @property {number} expires_in
 * @property {string} expires_at
 */

/**
 * @typedef {Object} AnalyticsFilters
 * @property {string} [start_date]
 * @property {string} [end_date]
 * @property {number} [technician_id]
 * @property {number} [workshop_id]
 * @property {number} [horizon_days]
 */

/**
 * @typedef {Object} AnalyticsScope
 * @property {AnalyticsScopeType} [scope]
 * @property {AnalyticsScopeType} [type]
 * @property {number} user_id
 * @property {string[]} roles
 * @property {number} [workshop_id]
 */

/**
 * @typedef {Object} AnalyticsPeriod
 * @property {string} start_date
 * @property {string} end_date
 * @property {string} timezone
 */

/**
 * @typedef {Object} AnalyticsSample
 * @property {number} activities
 * @property {number} comparable_completed_activities
 * @property {number} minimum_comparable_activities
 * @property {boolean} sufficient_for_duration_comparison
 */

/**
 * @typedef {Object} AnalyticsStatusDistributionItem
 * @property {string} status
 * @property {number} count
 */

/**
 * @typedef {Object} AnalyticsObservedMetric
 * @property {Object} actual_vs_planned
 * @property {Object} active_activities
 * @property {Object} scheduled_queue
 * @property {Object} cancellations
 * @property {AnalyticsStatusDistributionItem[]} status_distribution
 */

/**
 * @typedef {Object} TechnicianEfficiencyResponse
 * @property {AnalyticsPeriod} period
 * @property {AnalyticsScope} scope
 * @property {AnalyticsSample} sample
 * @property {Array<AnalyticsObservedMetric & { technician_id: number }>} technicians
 */

/**
 * @typedef {Object} WorkshopBottlenecksResponse
 * @property {AnalyticsPeriod} period
 * @property {AnalyticsScope} scope
 * @property {AnalyticsSample} sample
 * @property {Array<AnalyticsObservedMetric & { workshop_id: number }>} workshops
 */

/**
 * @typedef {Object} AnalyticsHorizon
 * @property {string} start_date
 * @property {string} end_date
 * @property {number} days
 * @property {string} timezone
 */

/**
 * @typedef {Object} AnalyticsForecastConfidence
 * @property {AnalyticsConfidenceLevel} level
 * @property {boolean} data_sufficient
 * @property {number} unknown_duration_activities
 * @property {string[]} reason_codes
 * @property {string[]} reasons
 */

/**
 * @typedef {Object} WorkloadForecast
 * @property {number} workshop_id
 * @property {AnalyticsHorizon} horizon
 * @property {Object} historical_demand
 * @property {Object} current_workload
 * @property {Object} capacity
 * @property {Object} forecast
 * @property {AnalyticsForecastConfidence} confidence
 * @property {string[]} assumption_codes
 * @property {string[]} assumptions
 * @property {string} algorithm_version
 */

/**
 * @typedef {Object} WorkloadForecastResponse
 * @property {string} algorithm_version
 * @property {AnalyticsScope} scope
 * @property {number} horizon_days
 * @property {WorkloadForecast[]} forecasts
 */

/**
 * @typedef {Object} AnalyticsRiskAlert
 * @property {string} id
 * @property {AnalyticsAlertSeverity} severity
 * @property {number} workshop_id
 * @property {Object} facts
 * @property {string} explanation
 * @property {string} explanation_code
 * @property {AnalyticsHorizon} horizon
 * @property {string[]} assumption_codes
 * @property {AnalyticsForecastConfidence} confidence
 */

/**
 * @typedef {Object} RiskAlertsResponse
 * @property {string} algorithm_version
 * @property {AnalyticsScope} scope
 * @property {number} horizon_days
 * @property {AnalyticsRiskAlert[]} alerts
 * @property {boolean} automatic_actions
 */

/**
 * @typedef {Object} AnalyticsRecommendation
 * @property {string} id
 * @property {AnalyticsRecommendationPriority} priority
 * @property {number} workshop_id
 * @property {string} suggested_review
 * @property {string} suggested_review_code
 * @property {Object} facts
 * @property {boolean} automatic_action
 * @property {AnalyticsHorizon} horizon
 * @property {string[]} assumption_codes
 * @property {AnalyticsForecastConfidence} confidence
 */

/**
 * @typedef {Object} RecommendationsResponse
 * @property {string} algorithm_version
 * @property {AnalyticsScope} scope
 * @property {number} horizon_days
 * @property {AnalyticsRecommendation[]} recommendations
 * @property {boolean} automatic_actions
 * @property {string} decision_owner
 */

export const ANALYTICS_CONFIDENCE_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
})

export const ANALYTICS_SEVERITIES = Object.freeze({
  INFO: 'info',
  MEDIUM: 'medium',
  HIGH: 'high',
})

export const ANALYTICS_PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
})
