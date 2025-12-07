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

export const fetchReports = async (status = 'PENDING', skip = 0, limit = 10) => {
  try {
    const params = new URLSearchParams();
    params.append('status', status);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    const data = await apiFetch(`reports?${params.toString()}`);
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    return await apiFetch(`reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  } catch (error) {
    console.error("Failed to update report status:", error);
    throw error;
  }
};

export const createReport = async (data) => {
  try {
    return await apiFetch('reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error("Failed to create report:", error);
    throw error;
  }
};