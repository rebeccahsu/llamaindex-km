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
  cluster: 'km-pro',
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
  cloudsql: 'test-b',
  /**
   * Google Storage Bucket Name
   */
  bucket: 'km-pro',
  /**
   * 靜態 IP 位址名稱
   */
  address: 'km-pro',
  /**
   * 相關憑證
   */
  certs: [
    {
      name: 'google-storage-credentials',
      filename: 'credentials.json',
      path: `${AppRoot}/scripts/deploy/pro/certs/storage-33d2aac078c0.json`
    }
  ]
}

export default config