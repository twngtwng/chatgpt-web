import type { ComputedRef, Ref } from 'vue'
import { txtToImg } from '@/api'
import { useChat } from '@/views/chat/hooks/useChat'

export interface StableDiffusionAPI {
  negative_prompt?: string
  cfg_scale?: number // 配置比例尺，默认为 7
  steps?: number // 每轮迭代中所执行的步骤数，默认为 50
  seed?: number // 随机数种子，默认为 -1，即使用随机种子
  prefix?: string // 前置咒语补充
  suffix?: string // 后置咒语补充
  noGPT?: boolean // 不用gpt创作咒语
  spell?: string // 前一句咒语
}

interface ImgPromptItem {
  key: string
  value: string
  options?: StableDiffusionAPI
}

export const imgPrompt: ImgPromptItem[] = [
  {
    key: '文转图 自由创作',
    value: '#文转图 自由创作: ',
    options: { noGPT: true },
  },
  {
    key: '文转图 随机效果',
    value: '#文转图 随机效果: ',
  },
  {
    key: '文转图 水墨风',
    value: '#文转图 水墨风: ',
    options: {
      prefix: '(ink and wash style:1.3), 2d, shukezouma, negative space, shuimobysim,',
      suffix: ' (chinese style:0.8),(Automatic white balance), (bamboo:1) background,<lora:AssistForShukezoumaMoxin_v10:0.3><lora:Moxin_10:0.4>',
      steps: 30,
      cfg_scale: 2,
      seed: 2643581225,
      negative_prompt: 'nsfw,lowres,blurry,simple background,jpeg artifacts,bad-artist,bad shadow,compressed image,low pixel,light spot, paintings,sketches,((monochrome)),((grayscale)),',
    },
  },
  {
    key: '文转图 宫崎骏',
    value: '#文转图 宫崎骏: ',
    options: {
      prefix: 'ghibli style, 2d,',
      suffix: ',<lora:studioGhibliStyle_offset:1>',
      steps: 30,
      cfg_scale: 2.5,
      seed: 1178811602,
      negative_prompt: '(painting by bad-artist-anime:0.9), (painting by bad-artist:0.9), watermark, text, error, blurry, jpeg artifacts, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, artist name, (worst quality, low quality:1.4), bad anatomy',
    },
  },
  {
    key: '文转图 人物',
    value: '#文转图 人物: ',
  },
  {
    key: '文转图 漫画',
    value: '#文转图 漫画: ',
    options: {
      prefix: 'lineart, monochrome,',
      suffix: ',<lora:animeLineartMangaLike_v30MangaLike:1>',
      steps: 20,
      cfg_scale: 2.5,
      seed: 1213302736,
      negative_prompt: '(worst quality, low quality:1.4), EasyNegative, (earrings:1.5),',
    },
  },
]

const manImgPrompt = [
  {
    keyword: ['女', '小孩'],
    prefixStyle: 'Chinese women,',
    prefix: 'cute, clear facial skin,',
    suffix: ',<lora:cuteAsianFace_v10:1>',
    steps: 25,
    cfg_scale: 2.5,
    seed: 1178811602,
    negative_prompt: 'paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans, (only body)',
  },
  {
    keyword: ['少年', '男', '伙'],
    prefixStyle: 'Chinese Male,',
    suffix: ',<lora:asianmale_v10:0.2>',
    steps: 20,
    cfg_scale: 2.5,
    seed: 1056888774,
    negative_prompt: '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck',
  },
]

export const isToImg = (message: string) => imgPrompt.some(item => message.startsWith(item.value))

export function useGenerateImg(config: {
  uuid: string
  dataSources: ComputedRef<Chat.Chat[]>
  conversationList: ComputedRef<Chat.Chat[]>
  usingContext: ComputedRef<boolean>
  scrollToBottom: () => void
  loading: Ref<boolean>
  prompt: Ref<string>
}) {
  const { addChat, updateChat } = useChat()
  const { uuid, loading, dataSources, scrollToBottom, prompt, usingContext, conversationList } = config

  return {
    genImg: async (index?: number) => {
      let options: Chat.ConversationRequest = {}
      const { requestOptions } = index ? dataSources.value[index] : {} as Chat.Chat
      const message = requestOptions?.prompt || prompt.value
      const targetPrompt = imgPrompt.find(item => message.startsWith(item.value))
      const imgTxt = targetPrompt && message.replace(targetPrompt.value.trim() || '', '')

      if (targetPrompt?.key.includes('文转图 人物')) {
        targetPrompt.options = {}
        manImgPrompt.forEach((item) => {
          const { keyword, ...opts } = item
          if (keyword.some(key => imgTxt?.includes(key)))
            targetPrompt.options = opts
        })
      }

      if (loading?.value)
        return

      if (!targetPrompt || !imgTxt || imgTxt.trim() === '')
        return

      if (!index) {
        addChat(
          +uuid,
          {
            dateTime: new Date().toLocaleString(),
            text: message,
            inversion: true,
            error: false,
            conversationOptions: null,
            requestOptions: { prompt: message, options: null },
          },
        )
        scrollToBottom()
        loading.value = true
        prompt.value = ''
        const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

        if (lastContext && usingContext.value)
          options = { ...lastContext }

        addChat(
          +uuid,
          {
            dateTime: new Date().toLocaleString(),
            text: '图片生成中...',
            loading: true,
            inversion: false,
            error: false,
            conversationOptions: null,
            requestOptions: { prompt: imgTxt, options: { ...options } },
          },
        )
        scrollToBottom()
      }
      else if (requestOptions?.options) {
        options = { ...requestOptions?.options }
        updateChat(
          +uuid,
          index,
          {
            dateTime: new Date().toLocaleString(),
            text: '图片重新生成中...',
            inversion: false,
            error: false,
            loading: true,
            conversationOptions: null,
            requestOptions: { prompt: message, options: { ...options } },
          },
        )
      }

      try {
        const imgOpts = { ...targetPrompt.options, spell: requestOptions?.options?.spell }
        const data = await txtToImg<{ url: string; spell?: string }>({
          data: { prompt: imgTxt, options: imgOpts },
        })
        updateChat(
          +uuid,
          index ?? dataSources.value.length - 1,
          {
            dateTime: new Date().toLocaleString(),
            text: `![](${encodeURIComponent(data.data.url)})`,
            inversion: false,
            error: false,
            loading: false,
            requestOptions: { prompt: message, options: { ...options, spell: data.data.spell } },
          },
        )
      }
      catch (e) {
        updateChat(
          +uuid,
          index ?? dataSources.value.length - 1,
          {
            dateTime: new Date().toLocaleString(),
            text: '图片生成失败',
            inversion: false,
            error: true,
            loading: false,
            conversationOptions: null,
            requestOptions: { prompt: message, options: { ...options } },
          },
        )
      }
      finally {
        loading.value = false
      }
    },
  }
}
