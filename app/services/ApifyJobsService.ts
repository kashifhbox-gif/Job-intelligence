import { ApifyClient } from 'apify-client';

export class ApifyJobsService {
  private client: ApifyClient;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('Apify API Token is missing. Please add it in Settings.');
    this.client = new ApifyClient({ token: apiKey });
  }

  private buildWebhookOption(webhookUrl: string) {
    if (webhookUrl && !webhookUrl.includes('localhost') && !webhookUrl.includes('127.0.0.1')) {
      return {
        webhooks: [{ 
          eventTypes: [
            'ACTOR.RUN.SUCCEEDED' as const,
            'ACTOR.RUN.FAILED' as const,
            'ACTOR.RUN.ABORTED' as const,
            'ACTOR.RUN.TIMED_OUT' as const
          ], 
          requestUrl: webhookUrl 
        }],
      };
    }
    return {};
  }

  /**
   * Dice Jobs — shahidirfan/dice-job-scraper
   */
  async startDiceScraper(
    keyword: string,
    location: string,
    posted_date: string,
    results_wanted: number,
    webhookUrl: string,
    maxPages?: number
  ) {
    return await this.client.actor('shahidirfan/dice-job-scraper').start(
      {
        keyword,
        location,
        posted_date: posted_date || '24h',
        results_wanted: results_wanted || 20,
        ...(maxPages && { maxPages }),
      },
      this.buildWebhookOption(webhookUrl)
    );
  }

  /**
   * Upwork — blackfalcondata/upwork-scraper
   */
  async startUpworkScraper(
    query: string,
    maxResults: number,
    webhookUrl: string,
    filters: {
      jobType?: string;
      experienceLevel?: string;
      budgetMin?: number;
      budgetMax?: number;
      hourlyMin?: number;
      hourlyMax?: number;
      sort?: string;
    } = {}
  ) {
    const input: Record<string, any> = {
      query,
      maxResults: maxResults || 50,
      sort: filters.sort || 'recency',
    };

    if (filters.jobType) input.jobType = filters.jobType.toLowerCase();
    if (filters.experienceLevel) input.experienceLevel = filters.experienceLevel;
    if (filters.budgetMin || filters.budgetMax) {
      input.budget = `${filters.budgetMin || 0}-${filters.budgetMax || ''}`;
    }
    if (filters.hourlyMin || filters.hourlyMax) {
      input.hourlyRate = `${filters.hourlyMin || 0}-${filters.hourlyMax || ''}`;
    }

    return await this.client.actor('blackfalcondata/upwork-scraper').start(
      input,
      this.buildWebhookOption(webhookUrl)
    );
  }

  /**
   * Freelancer — ahmed_jasarevic/freelancer-jobs-scraper
   */
  async startFreelancerScraper(
    query: string,
    limit: number,
    webhookUrl: string,
    filters: {
      skills?: string[];
      sort?: string;
      fixed_budget_min?: number;
      fixed_budget_max?: number;
      hourly_rate_min?: number;
      hourly_rate_max?: number;
    } = {}
  ) {
    return await this.client.actor('ahmed_jasarevic/freelancer-jobs-scraper').start(
      {
        query,
        limit: limit || 100,
        sort: filters.sort || 'date_desc',
        ...(filters.skills?.length && { skills: filters.skills }),
        ...(filters.fixed_budget_min && { fixed_budget_min: filters.fixed_budget_min }),
        ...(filters.fixed_budget_max && { fixed_budget_max: filters.fixed_budget_max }),
        ...(filters.hourly_rate_min && { hourly_rate_min: filters.hourly_rate_min }),
        ...(filters.hourly_rate_max && { hourly_rate_max: filters.hourly_rate_max }),
      },
      this.buildWebhookOption(webhookUrl)
    );
  }

  /**
   * LinkedIn Jobs — curious_coder/linkedin-jobs-scraper (alias: hKByXkMQaC5Qt9UMN)
   */
  async startLinkedInJobsScraper(
    searchUrl: string,
    count: number,
    webhookUrl: string,
    options: {
      scrapeCompany?: boolean;
      splitByLocation?: boolean;
    } = {}
  ) {
    return await this.client.actor('hKByXkMQaC5Qt9UMN').start(
      {
        urls: [searchUrl],
        count: count || 100,
        scrapeCompany: options.scrapeCompany ?? false,
        splitByLocation: options.splitByLocation ?? false,
      },
      this.buildWebhookOption(webhookUrl)
    );
  }

  /**
   * Fetch dataset results from a completed run
   */
  async getDatasetItems(runId: string) {
    return await this.client.run(runId).dataset().listItems();
  }
}
