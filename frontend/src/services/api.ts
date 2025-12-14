import * as analytics from './analytics';
import * as auth from './auth';
import * as media from './media';
import * as methods from './methods';
import * as samples from './samples';
import * as settings from './settings';
import * as storage from './storage';
import * as strains from './strains';
import * as taxonomy from './taxonomy';
import * as uploads from './uploads';
import { assertOk, request, toApiError } from './http';
import type { ApiError } from './http';

import type {
  AnalyticsOverview,
  Media,
  Method,
  PaginatedResponse,
  LegendContent,
  Sample,
  SamplePhoto,
  SampleTypeOption,
  Strain,
  StrainPhoto,
  UiBinding,
  StorageBox,
  StorageBoxWithCells,
} from '../types/api';

export const ApiService = {
  ...auth,
  ...settings,
  ...samples,
  ...strains,
  ...storage,
  ...media,
  ...methods,
  ...taxonomy,
  ...analytics,
  ...uploads,
};

export {
  ApiError,
  assertOk,
  request,
  toApiError,
};

export type {
  AnalyticsOverview,
  Media,
  Method,
  PaginatedResponse,
  LegendContent,
  Sample,
  SamplePhoto,
  SampleTypeOption,
  Strain,
  StrainPhoto,
  UiBinding,
  StorageBox,
  StorageBoxWithCells,
};
