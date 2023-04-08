import fs from 'fs'
import * as path from 'path'
import * as process from 'process'
import type { RequestInit } from 'node-fetch'
import fetch from 'node-fetch'
import httpsProxyAgent from 'https-proxy-agent'
import { isNotEmptyString } from '../../utils/is'
import { chatReplyProcess } from '../../chatgpt'
import type { StableDiffusionAPI } from './constants'
import { defaultSpell, defaultTxt2ImgOptions } from './constants'

const baseURL = process.env.COLAL_ADDRESS
const fetchOption: RequestInit = {}

export interface Txt2ImgResponse {
  images?: string[]
  parameters?: object
  info?: string
}

const fetchFn = <T = any>(url: string, options?: RequestInit) => {
  const address = `${baseURL}${url}`
  const ops = { ...fetchOption, ...options }
  return fetch(address, ops).then((res) => {
    if (res.status !== 200)
      throw new Error(res.statusText)

    else
      return res.json() as T
  })
}

const init = () => {
  if (isNotEmptyString(process.env.HTTPS_PROXY) || isNotEmptyString(process.env.ALL_PROXY)) {
    const httpsProxy = process.env.HTTPS_PROXY || process.env.ALL_PROXY
    if (httpsProxy)
      fetchOption.agent = new httpsProxyAgent.HttpsProxyAgent(httpsProxy)
  }
}

function getValidFileName(fileName) {
  // 定义不允许出现在文件名中的特殊字符
  const invalidChars = /[\\/:"*?<>|]/g

  // 将不允许出现在文件名中的特殊字符替换为空格
  const validFileName = fileName.replace(invalidChars, '_').replace(/ /g, '_')

  // 去除文件名前后的空格并返回结果
  return validFileName.trim()
}

const isDev = process.env.IS_DEV === 'true'
const publicPathPrefix = isDev ? '../' : ''
const toPng = (name = '', base64: string) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(process.cwd(), publicPathPrefix, 'public/tti')))
      fs.mkdirSync(path.join(process.cwd(), publicPathPrefix, 'public/tti'))

    const dir = `public/tti/${`${Date.now()}_${getValidFileName(name)}`}.png`
    const dataBuffer = Buffer.from(base64, 'base64') // 把base64码转成buffer对象，
    const output = path.join(process.cwd(), publicPathPrefix, dir)
    fs.writeFile(output, dataBuffer, (err) => { // 用fs写入文件
      if (err)
        reject(err)
      else
        resolve(isDev ? dir : dir.replace('public/', ''))
    })
  })
}

interface txt2ImageRequest {
  prompt?: string
  options?: StableDiffusionAPI
}

export const txt2Image = async (req, res) => {
  if (!baseURL) {
    res.status(401).send({
      status: 'Fail',
      data: null,
      message: '接口不见了',
    })
    return
  }
  const { prompt: rawPrompt = '', options = {} } = req.body as txt2ImageRequest
  const { noGPT, prefix = '', suffix = '', spell, ...resetOpts } = options
  const prompt = rawPrompt.trim()
  if (!baseURL) {
    res.status(401).send({
      status: 'Fail',
      data: null,
      message: 'prompt 不能为空',
    })
    return
  }
  try {
    let gptRes: { data: unknown } = { data: { text: prompt } }
    if (!spell && !noGPT)
      gptRes = await chatReplyProcess({ message: defaultSpell.replace('{{prompt}}', prompt) })

    const gptText = `${prefix} ${(gptRes.data as any)?.text} ${suffix}`

    // console.log('speel: ', gptText, options)

    const data = await fetchFn<Txt2ImgResponse>('/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...defaultTxt2ImgOptions,
        ...resetOpts,
        prompt: gptText || prompt,
      }),
    })

    if (!data?.images?.length)
      return res.status(401).send({ status: 'Fail', data })

    const imgUrl = await toPng(prompt, data.images[0])
    return res.send({
      status: 'Success',
      message: 'Image generated successfully',
      data: {
        url: imgUrl,
        parameters: data.parameters,
        spell: data.info,
      },
    })
  }
  catch (err) {
    res.status(401).send({
      status: 'Fail',
      data: null,
      message: err.toString(),
    })
  }
}

(async () => init())()
