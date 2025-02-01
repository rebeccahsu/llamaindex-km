import AppRoot from 'app-root-path'

const config = {
  account: '',
  /**
   * GCP Project ID
   */
  project: 'km',
  /**
   * docker images repo
   */
  repo: 'asia.gcr.io',
  /**
   * 叢集名稱
   */
  cluster: 'km-dev',
  /**
   * 叢集位置 (zone or region)
   *
   * - zone: asia-east2-b
   * - region: asia-east2
   */
  location: 'asia-east1',
  region: 'asia-east1',
  /**
   * Cloud SQL instance id
   */
  cloudsql: 'test-a',
  /**
   * Google Storage Bucket Name
   */
  bucket: 'km-dev',
  /**
   * 靜態 IP 位址名稱
   */
  address: 'km.com.tw',
  /**
   * 相關憑證
   */
  certs: [
    {
      name: 'google-storage-credentials',
      filename: 'credentials.json',
      path: `${AppRoot}/scripts/deploy/dev/certs/km-d6fc0a03375d.json`
    }
  ]
};

export default config;
