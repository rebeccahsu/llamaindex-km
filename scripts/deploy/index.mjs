#!/usr/bin/env zx

/**
 *
 * @see https://blog.johnwu.cc/article/gcp-kubernetes-connect-to-cloudsql.html
 * @see https://cloud.google.com/sql/docs/mysql/sql-proxy
 */

import AppRoot from 'app-root-path'
import Terminal from 'terminal-kit'

/**
 * @link https://github.com/cronvel/terminal-kit/issues/200
 */
const termkit = Terminal.terminal

import devConfig from './dev/config.js'
import proConfig from './pro/config.js'

const isDev = /^dev(elopment)?$/i.test(process.env.NODE_ENV)

const {
  account,
  project,
  repo,
  cluster,
  location,
  region,
  cloudsql,
  bucket,
  address,
  certs
} = isDev ? devConfig : proConfig

// ###############################################################################################
const env = isDev ? 'dev' : 'pro'
const context = `gke_${project}_${location}_${cluster}`
const isZone = /-\w{1}$/.test(location)
const now = Date.now()

// change pwd or allow root user connect
// gcloud sql users set-password root --host=% --instance cloudsql-mysql --password=<密碼>

async function login() {
  const logged = await $`gcloud auth list --filter="status:ACTIVE account:${account}" --format="value(account)" --limit=1`

  if (logged.stdout.trim() !== account) {
    // https://stackoverflow.com/questions/53306131/difference-between-gcloud-auth-application-default-login-and-gcloud-auth-logi
    await $`gcloud auth login --update-adc`
  }

  return true
}

async function configTask(name) {
  switch (name) {
    case 'update': // 若發生指令相關錯誤，請嘗試更新 gcloud components
      await $`gcloud components update`
      break

    case 'init': // 各環境只需執行一次 (建立 context)，多次不會錯誤
      await $`gcloud components install kubectl`
      await $`kubectl config set-context ${context} --cluster=${context} --namespace=${context}`
      try {
        await $`gcloud config configurations create ${cluster} --verbosity=none --activate`
      } catch (err) {
        termkit.blue(`gcloud configurations '${cluster}' already exists.\n`)
      }
      await $`gcloud container clusters get-credentials ${cluster} --project=${project} --region=${region}`
      termkit.green('done.\n')
      break

    case 'config': // 若無特殊需求，不一定要執行 (後續指令皆已附加相關參數)
      await $`kubectl config use-context ${context}`
      await $`gcloud config configurations activate ${cluster}`
      await $`gcloud config set project ${project}`
      await $`gcloud config set account ${account}`
      await $`gcloud config set compute/${isZone ? 'zone' : 'region'} ${location}`
      await $`gcloud container clusters get-credentials ${cluster} --project=${project} --location=${location} --account=${account}`
      break

    default:
      return false
  }
  return true
}

async function task(name) {
  switch (name) {
    case 'build-docker':
      await $`docker system prune --force`
      await $`git rev-parse --verify HEAD > ${AppRoot}/version-${env}`

      await $`yarn run build`

      // for gcp
      await $`docker buildx build --build-arg="STARTUP=${env}:start" --build-arg="NODE_ENV=production" --platform linux/amd64 -t ${repo}/${project}/${env}:${now} -t ${repo}/${project}/${env}:latest ${AppRoot}/ -f ${AppRoot}/Dockerfile` // --no-cache

      // for mac local test
      // await $`docker buildx build --build-arg="STARTUP=${env}:start" --build-arg="NODE_ENV=production" --platform linux/arm64/v8 -t ${repo}/${project}/${env}:${now} -t ${repo}/${project}/${env}:latest ${AppRoot}/ -f ${AppRoot}/Dockerfile --no-cache`

      await $`gcloud auth configure-docker`
      await $`docker push ${repo}/${project}/${env}:latest`
      await $`docker push ${repo}/${project}/${env}:${now}`

      termkit('image:').styleReset(` ${repo}/${project}/${env}:${now}\n`)
      break

    case 'create-address':
      await $`gcloud compute addresses create ${address} --global --project=${project} --account=${account}`
      break

    case 'create-ingress':
      await $`kubectl --context=${context} apply -f ingress.yaml`
      break

    case 'create-appserver':
      await $`kubectl --context=${context} apply -f appserver-deployment.yaml`
      await $`kubectl --context=${context} apply -f appserver-service.yaml`
      break

    case 'create-worker':
      await $`kubectl --context=${context} apply -f worker-deployment.yaml`
      break

    case 'create-mysql':
      await $`kubectl --context=${context} apply -f mysql-deployment.yaml`
      await $`kubectl --context=${context} apply -f mysql-service.yaml`
      break

    case 'create-mongo':
      await $`kubectl --context=${context} apply -f rbac.yaml`
      // await $`kubectl --context=${context} apply -f googlecloud_hdd.yaml`
      // await $`kubectl --context=${context} apply -f googlecloud_ssd.yaml`
      await $`kubectl --context=${context} apply -f mongo-statefulset.yaml`
      await $`kubectl --context=${context} apply -f mongo-service.yaml`
      break

    case 'create-redis':
      await $`kubectl --context=${context} apply -f redis-deployment.yaml`
      await $`kubectl --context=${context} apply -f redis-service.yaml`
      break
    
    case 'create-milvus':
      await $`kubectl --context=${context} apply -f milvus-config-map.yaml`
      await $`kubectl --context=${context} apply -f milvus-persistent-volume-claim.yaml`
      await $`kubectl --context=${context} apply -f milvus-deployment.yaml`
      await $`kubectl --context=${context} apply -f milvus-service.yaml`
      break

    case 'update-appserver':
      await task('build-docker')
      // https://tachingchen.com/tw/blog/Kubernetes-Rolling-Update-with-Deployment/
      await $`kubectl --context=${context} set image deployment appserver appserver=${repo}/${project}/${env}:${now} --record`
      await $`kubectl --context=${context} rollout status deployment appserver`
      break

    case 'update-worker':
      await task('build-docker')
      // https://tachingchen.com/tw/blog/Kubernetes-Rolling-Update-with-Deployment/
      await $`kubectl --context=${context} set image deployment worker worker=${repo}/${project}/${env}:${now} --record`
      await $`kubectl --context=${context} rollout status deployment worker`
      break

    case 'replace-appserver':
      // https://tachingchen.com/tw/blog/Kubernetes-Rolling-Update-with-Deployment/
      await $`kubectl --context=${context} replace -f appserver-deployment.yaml`
      await $`kubectl --context=${context} rollout status deployment appserver`
      break
    
    case 'replace-ingress':
      await $`kubectl --context=${context} replace -f ingress.yaml`
      break

    case 'replace-worker':
      // https://tachingchen.com/tw/blog/Kubernetes-Rolling-Update-with-Deployment/
      await $`kubectl --context=${context} replace -f worker-deployment.yaml`
      await $`kubectl --context=${context} rollout status deployment worker`
      break

    case 'clear-flags':
      await $`gcloud sql instances patch ${cloudsql} --project=${project} --account=${account} --clear-database-flags`
      break

    case 'set-flags': {
      // ! Note: lower_case_table_names=1 必須在建立時就設定，後續不可更改 (MySQL 8.0)
      const flags = [
        'default_time_zone=+00:00',
        'character_set_server=utf8mb4',
        'transaction_isolation=READ-COMMITTED',
        'explicit_defaults_for_timestamp=on',
        'log_bin_trust_function_creators=on'
      ].join(',')

      await $`gcloud sql instances patch ${cloudsql} --project=${project} --account=${account} --database-flags ${flags}`
      break
    }

    case 'import-certs':
      for (const cert of certs) {
        await $`kubectl --context=${context} create secret generic ${cert.name} --from-file=${cert.filename}="${cert.path}"`
      }
      await $`kubectl --context=${context} get secret`
      break

    case 'storage-cors':
      await $`gsutil cors set ./cors-json-file.json gs://${bucket}/`
      await $`gsutil cors get gs://${bucket}/`
      break

    case 'get-clusters':
      await $`kubectl config get-clusters`
      break

    case 'get-contexts':
      await $`kubectl config get-contexts`
      break

    case 'current-context':
      await $`kubectl config current-context`
      break

    case 'list-ssl':
      await $`gcloud compute ssl-certificates list --global --project=${project} --account=${account}`
      break

    case 'get-deployments':
      await $`kubectl --context=${context} get deployments`
      break

    case 'get-pods':
      await $`kubectl --context=${context} get pods --show-labels`
      break

    case 'logs':
      await $`kubectl --context=${context} logs --since=0s --timestamps`
      break

    case 'redis':
      await $`kubectl --context=${context} port-forward redis-dfc5bf6c8-5xwmz 6379`
      break

    case 'mongo':
      await $`kubectl --context=${context} port-forward mongo-0 27017`
      break

    default:
      return false
  }
  return true
}

async function run(name) {
  termkit.bgWhite.black(`task:`).styleReset(` ${name}, now: ${now}\n`)

  try {
    if (!await configTask(name) && await login() && !await task(name)) {
      throw new Error(`unsupport task: ${name}`)
    }
  } catch (err) {
    termkit.bgRed('error:').styleReset(` ${err?.message || err?.name || err}\n`)
  }

  termkit.removeAllListeners()
  termkit.processExit(0)
}

run(`${argv._[0]}`.toLowerCase())
