import axios, { AxiosInstance } from "axios";

export interface GoogleAdsCredentials {
  developer_token: string;
  customer_id: string;
  refresh_token: string;
  client_id?: string;
  client_secret?: string;
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export class GoogleAdsAPIClient {
  private client: AxiosInstance;
  private credentials: GoogleAdsCredentials;
  private accessToken: string | null = null;

  constructor(credentials: GoogleAdsCredentials) {
    this.credentials = credentials;

    this.client = axios.create({
      baseURL: "https://googleads.googleapis.com/v17",
    });
  }

  /**
   * Get or refresh the access token using the refresh token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        refresh_token: this.credentials.refresh_token,
        grant_type: "refresh_token",
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw new Error("Failed to authenticate with Google Ads API");
    }
  }

  /**
   * Test connection - verify credentials are valid
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();
      const customerId = this.credentials.customer_id.replace(/-/g, "");

      const response = await axios.post(
        `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
        {
          query: "SELECT customer.id, customer.descriptive_name LIMIT 1",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": this.credentials.developer_token,
          },
        }
      );

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Unknown error";
      console.error("Google Ads connection test failed:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(): Promise<GoogleAdsCampaign[]> {
    try {
      const accessToken = await this.getAccessToken();
      const customerId = this.credentials.customer_id.replace(/-/g, "");

      const response = await axios.post(
        `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
        {
          query: `
            SELECT
              campaign.id,
              campaign.name,
              campaign.status,
              campaign.budget_settings.amount_micros,
              metrics.impressions,
              metrics.clicks,
              metrics.conversions,
              metrics.cost_micros
            FROM campaign
            WHERE segments.date DURING LAST_30_DAYS
            LIMIT 100
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": this.credentials.developer_token,
          },
        }
      );

      const campaigns = response.data.results || [];
      return campaigns.map((result: any) => {
        const campaign = result.campaign;
        const metrics = result.metrics;
        const costMicros = metrics?.cost_micros || 0;
        const spend = costMicros / 1000000;
        const clicks = metrics?.clicks || 0;
        const impressions = metrics?.impressions || 0;

        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          budget: (campaign.budget_settings?.amount_micros || 0) / 1000000,
          spend,
          impressions,
          clicks,
          conversions: metrics?.conversions || 0,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpc: clicks > 0 ? spend / clicks : 0,
        };
      });
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }
}
