// https://docs.google.com/spreadsheets/d/1bLoMDvgJ_MsNmSdSzJ3-pEo6gQ_VX8sZveSTZlzFXQ4/edit#gid=0

import fs from 'fs'
import axios from 'axios'
import papa from 'papaparse'
import AppRoot from 'app-root-path'

const csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmRio0wRk7fDRq65mVYz_OYeAXD087UwrSOyUDQpT9YEUF4yGFRUFd-3wUdFOFowLJuB6RPpjSI6r5/pub?gid=0&single=true&output=csv'
const outfolder = `${AppRoot}/src/modules/i18n/locales/`
const locales = ['en-US', 'zh-TW']

const fetch = (url) => {
  const options = {
    url,
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'UTF-8',
      'Content-Type': 'application/json; charset=UTF-8',
    }
  }
  return axios(options)
}

console.log('start to import')

fetch(csv).then((res) => {
  const parsed = papa.parse(
    res.data,
    {
      header: false,
      delimiter: ','
    }
  )

  const lang = {}

  locales.forEach((locale, idx) => {
    const filename = locale.replace('-', '_')

    parsed.data.forEach((row) => {
      const key = row[1]       // 'ID'
      if (`${row[1]}`.trim().length) {
        lang[key] = row[idx + 3] // + 3 to skip 'Category', 'ID', 'Fields
      }
    })

    const outfile = `${filename}.gen.ts`
    const localejs = `/* eslint-disable */\nexport default ${JSON.stringify(lang, null, 2)}\n`
    fs.writeFile(`${outfolder}${outfile}`, localejs, 'utf-8', (err) => {
      if (err) {
        console.log('#localejs', err)
      } else {
        console.log(`${outfile} completed`)
      }
    })
  })
})
