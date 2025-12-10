// Copyright 2025 HouHackathon-CQP
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { apiFetch } from './apiClient';

/**
 * Send notification to mobile apps (push to all registered tokens)
 * @param {Object} payload - Notification data
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} payload.data - Additional data
 * @param {boolean} payload.dry_run - Whether to do a dry run
 * @returns {Promise<Object>}
 */
export const sendNotification = async (payload) => {
  return apiFetch('notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

/**
 * Send notification to a Firebase topic
 * @param {Object} payload - Topic notification data
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} payload.data - Additional data
 * @param {string} [payload.topic] - Topic name (optional, uses default from env)
 * @param {boolean} payload.dry_run - Whether to do a dry run
 * @returns {Promise<Object>}
 */
export const sendTopicNotification = async (payload) => {
  return apiFetch('notifications/send/topic', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

/**
 * Get notification history
 * @param {Object} params - Query parameters
 * @param {number} [params.skip=0] - Number of records to skip
 * @param {number} [params.limit=100] - Max records to return
 * @param {string} [params.notification_type] - Filter by type: 'token' or 'topic'
 * @param {number} [params.user_id] - Filter by target user ID
 * @returns {Promise<Object>}
 */
export const getNotificationHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.skip !== undefined) queryParams.append('skip', params.skip);
  if (params.limit !== undefined) queryParams.append('limit', params.limit);
  if (params.notification_type) queryParams.append('notification_type', params.notification_type);
  if (params.user_id) queryParams.append('user_id', params.user_id);
  
  const endpoint = `notifications/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return apiFetch(endpoint, {
    method: 'GET'
  });
};

/**
 * Get notification detail by ID
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>}
 */
export const getNotificationById = async (notificationId) => {
  return apiFetch(`notifications/history/${notificationId}`, {
    method: 'GET'
  });
};

/**
 * Cleanup old notification history
 * @param {number} [days=90] - Delete notifications older than this many days
 * @returns {Promise<Object>}
 */
export const cleanupNotificationHistory = async (days = 90) => {
  return apiFetch(`notifications/history/cleanup?days=${days}`, {
    method: 'DELETE'
  });
};

/**
 * Get list of registered device tokens
 * @returns {Promise<Array>}
 */
export const getDeviceTokens = async () => {
  return apiFetch('notifications/tokens', {
    method: 'GET'
  });
};

/**
 * Get AI weather insights
 * @param {Object} params - Query parameters
 * @param {number} params.lat - Latitude (default: 21.0285)
 * @param {number} params.lon - Longitude (default: 105.8542)
 * @param {string} params.provider - AI provider: 'gemini', 'groq', or 'auto' (default: 'auto')
 * @param {string} [params.model] - Optional model override
 * @returns {Promise<Object>}
 */
export const getAIWeatherInsights = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.lat !== undefined) queryParams.append('lat', params.lat);
  if (params.lon !== undefined) queryParams.append('lon', params.lon);
  if (params.provider) queryParams.append('provider', params.provider);
  if (params.model) queryParams.append('model', params.model);
  
  const endpoint = `ai/weather-insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return apiFetch(endpoint, {
    method: 'POST'
  });
};
