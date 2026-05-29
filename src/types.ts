/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StoreInfo {
  placeName: string;
  targetArea: string;
  mainMenu: string;
  keywords: string;
  useBooking: boolean;
  useTalkTalk: boolean;
  useCoupon: boolean;
  useSafeCall: boolean;
  visitorReviews: number | string;
  blogReviews: number | string;
}

export interface DiagnosisResult {
  seoScore: string;
  seoRank: string;
  problem: string;
  effect: string;
  competitorCount: string;
  competition: string;
  reviewProblem: string;
}
