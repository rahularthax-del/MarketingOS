import axios, { AxiosInstance } from "axios";

export interface MetaCredentials {
  access_token: string;
  account_id: string;
  business_account_id?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  picture: string;
  followers_count?: number;
  engagement_rate?: number;
}

export interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  followers_count?: number;
  engagement_rate?: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  ctr: number;
  cpa: number;
}

export interface Post {
  id: string;
  message: string;
  type: string;
  created_time: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  reach?: number;
  impressions?: number;
}

export class MetaAPIClient {
  private graphClient: AxiosInstance;
  private marketingClient: AxiosInstance;
  private credentials: MetaCredentials;
  private igAccountsCache: InstagramAccount[] | null = null;

  constructor(credentials: MetaCredentials) {
    this.credentials = credentials;

    this.graphClient = axios.create({
      baseURL: "https://graph.instagram.com/v18.0",
      params: {
        access_token: credentials.access_token,
      },
    });

    this.marketingClient = axios.create({
      baseURL: "https://graph.facebook.com/v18.0",
      params: {
        access_token: credentials.access_token,
      },
    });
  }

  /**
   * Get all Facebook Pages for this user
   */
  async getPages(): Promise<FacebookPage[]> {
    try {
      const response = await this.marketingClient.get("/me/accounts", {
        params: {
          fields: "id,name,picture.type(large),fan_count",
        },
      });

      return response.data.data.map((page: any) => ({
        id: page.id,
        name: page.name,
        picture: page.picture?.data?.url || "",
        followers_count: page.fan_count || 0,
      }));
    } catch (error) {
      console.error("Error fetching Facebook pages:", error);
      throw new Error("Failed to fetch Facebook pages");
    }
  }

  /**
   * Get ALL Instagram business accounts accessible to this token user
   */
  private async getAllInstagramAccounts(): Promise<InstagramAccount[]> {
    if (this.igAccountsCache) return this.igAccountsCache;

    try {
      // Try endpoint 1: Get from /me/instagram_business_accounts
      console.log("Attempting to fetch Instagram accounts from /me/instagram_business_accounts");
      const response = await this.marketingClient.get("/me/instagram_business_accounts", {
        params: {
          fields: "id,username,name,followers_count,biography",
        },
      });

      console.log(`Instagram accounts found:`, response.data.data);

      const accounts = response.data.data.map((ig: any) => ({
        id: ig.id,
        username: ig.username,
        name: ig.name || ig.username,
        followers_count: ig.followers_count || 0,
      }));

      this.igAccountsCache = accounts;
      return accounts;
    } catch (error) {
      console.error("Error fetching Instagram accounts from /me endpoint:", error);
      return [];
    }
  }

  /**
   * Get Instagram account connected to a Facebook Page
   */
  async getInstagramAccounts(pageId: string): Promise<InstagramAccount[]> {
    try {
      // First try the direct page approach
      const response = await this.marketingClient.get(`/${pageId}`, {
        params: {
          fields: "id,name,instagram_business_account{id,username,name,followers_count}",
        },
      });

      const igAccount = response.data.instagram_business_account;
      if (igAccount) {
        console.log(`Found Instagram account directly on page ${pageId}:`, igAccount);
        return [
          {
            id: igAccount.id,
            username: igAccount.username,
            name: igAccount.name || igAccount.username,
            followers_count: igAccount.followers_count || 0,
          },
        ];
      }

      // If not found on page, fetch all Instagram accounts from ad account
      console.log(`Instagram account not found on page ${pageId}, fetching from ad account instead`);
      const allAccounts = await this.getAllInstagramAccounts();
      return allAccounts;
    } catch (error) {
      console.error(`Error fetching Instagram accounts for page ${pageId}:`, error);
      // Fallback to fetching from ad account
      return await this.getAllInstagramAccounts();
    }
  }

  /**
   * Get recent posts from Instagram account
   */
  async getInstagramPosts(igAccountId: string): Promise<Post[]> {
    try {
      const response = await this.graphClient.get(`/${igAccountId}/media`, {
        params: {
          fields: "id,caption,media_type,timestamp,like_count,comments_count",
        },
      });

      return response.data.data.map((post: any) => ({
        id: post.id,
        message: post.caption || "",
        type: post.media_type,
        created_time: post.timestamp,
        likes_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
      }));
    } catch (error) {
      console.error("Error fetching Instagram posts:", error);
      return [];
    }
  }

  /**
   * Get all campaigns for this ad account
   */
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const adAccountId = `act_${this.credentials.account_id.replace("act_", "")}`;

      const response = await this.marketingClient.get(`/${adAccountId}/campaigns`, {
        params: {
          fields:
            "id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(lifetime){spend,impressions,clicks,conversions,actions,action_values}",
        },
      });

      return response.data.data.map((campaign: any) => {
        const insights = campaign.insights?.data?.[0] || {};
        const conversions = Array.isArray(insights.conversions)
          ? insights.conversions[0]?.value || 0
          : insights.conversions || 0;
        const spend = parseFloat(insights.spend || "0");
        const actions = Array.isArray(insights.actions)
          ? insights.actions.reduce((sum: number, a: any) => sum + (a.value || 0), 0)
          : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          budget: campaign.daily_budget || campaign.lifetime_budget || 0,
          spend,
          impressions: insights.impressions || 0,
          clicks: insights.clicks || 0,
          conversions,
          roas: spend > 0 ? (actions / spend) * 100 : 0,
          ctr: (insights.clicks || 0) / (insights.impressions || 1) * 100,
          cpa: conversions > 0 ? spend / conversions : 0,
        };
      });
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData: {
    name: string;
    objective: string;
    daily_budget?: number;
    lifetime_budget?: number;
  }): Promise<Campaign> {
    try {
      const adAccountId = `act_${this.credentials.account_id.replace("act_", "")}`;

      const response = await this.marketingClient.post(`/${adAccountId}/campaigns`, {
        name: campaignData.name,
        objective: campaignData.objective,
        status: "PAUSED",
        daily_budget: campaignData.daily_budget
          ? campaignData.daily_budget * 100
          : undefined,
        lifetime_budget: campaignData.lifetime_budget
          ? campaignData.lifetime_budget * 100
          : undefined,
      });

      return {
        id: response.data.id,
        name: campaignData.name,
        status: "PAUSED",
        objective: campaignData.objective,
        budget: campaignData.daily_budget || campaignData.lifetime_budget || 0,
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roas: 0,
        ctr: 0,
        cpa: 0,
      };
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw new Error("Failed to create campaign");
    }
  }

  /**
   * Update campaign budget
   */
  async updateCampaignBudget(
    campaignId: string,
    budget: number,
    budgetType: "daily" | "lifetime" = "daily"
  ): Promise<boolean> {
    try {
      const budgetField = budgetType === "daily" ? "daily_budget" : "lifetime_budget";

      await this.marketingClient.post(`/${campaignId}`, {
        [budgetField]: budget * 100,
      });

      return true;
    } catch (error) {
      console.error("Error updating campaign budget:", error);
      return false;
    }
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: string): Promise<boolean> {
    try {
      await this.marketingClient.post(`/${campaignId}`, {
        status: status.toUpperCase(),
      });

      return true;
    } catch (error) {
      console.error("Error updating campaign status:", error);
      return false;
    }
  }

  /**
   * Test connection - verify credentials are valid
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.marketingClient.get("/me", {
        params: {
          fields: "id,name",
        },
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error";
      console.error("Meta API connection test failed:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}
