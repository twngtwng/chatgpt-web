export interface StableDiffusionAPI {
  enable_hr?: boolean // 是否启用高分辨率模式，默认为 false
  denoising_strength?: number // 降噪强度，默认为 0
  firstphase_width?: number // 第一阶段的宽度，默认为 0
  firstphase_height?: number // 第一阶段的高度，默认为 0
  hr_scale?: number // 高分辨率模式下的放缩倍数，默认为 2
  hr_upscaler?: string // 高分辨率模式下的上采样器名称，默认为空字符串
  hr_second_pass_steps?: number // 高分辨率模式下的第二遍迭代次数，默认为 0
  hr_resize_x?: number // 在高分辨率模式下对输入图像进行调整的宽度，默认为 0
  hr_resize_y?: number // 在高分辨率模式下对输入图像进行调整的高度，默认为 0
  prompt?: string // 用于描述具体画面的词语或者句子，默认为空字符串
  styles?: string[] // 风格列表，默认只有一个元素
  seed?: number // 随机数种子，默认为 -1，即使用随机种子
  subseed?: number // 子种子，默认为 -1，即不使用子种子
  subseed_strength?: number // 子种子强度，默认为 0
  seed_resize_from_h?: number // 将种子图像调整为指定大小后再输入生成器网络，高度，默认为 -1，即不进行调整
  seed_resize_from_w?: number // 将种子图像调整为指定大小后再输入生成器网络，宽度，默认为 -1，即不进行调整
  sampler_name?: string // 采样器名称，默认为 "Sampler"
  batch_size?: number // 批量大小，默认为 1
  n_iter?: number // 迭代次数，默认为 1
  steps?: number // 每轮迭代中所执行的步骤数，默认为 50
  cfg_scale?: number // 配置比例尺，默认为 7
  width?: number // 输入图像的宽度，默认为 512
  height?: number // 输入图像的高度，默认为 512
  restore_faces?: boolean // 是否还原面部特征，默认为 false
  tiling?: boolean // 是否对输入图像进行平铺操作，默认为 false
  do_not_save_samples?: boolean // 是否保存生成的图像样本，默认为 false
  do_not_save_grid?: boolean // 是否保存生成的网格图像，默认为 false
  negative_prompt?: string // 负向描述词，默认为空字符串
  eta?: number // 噪声参数 eta，默认为 0
  s_churn?: number // 噪声参数 s_churn，默认为 0
  s_tmax?: number // 噪声参数 s_tmax，默认为 0
  s_tmin?: number // 噪声参数 s_tmin，默认为 0
  s_noise?: number // 噪声参数 s_noise，默认为 1
  override_settings?: object // 重写设置字典
  override_settings_restore_afterwards?: boolean // 是否在运行结束后还原到原始设置，默认为 true
  script_args?: string[] // 脚本参数列表，默认为空数组
  sampler_index?: string // 采样器索引
  script_name?: string // 脚本名称，默认为空字符串
  send_images?: boolean // 是否发送图像，默认为 true
  save_images?: boolean // 是否保存图像，默认为 false
  alwayson_scripts?: object // 总是开启的脚本字典，默认为空对象
  prefix?: string // 前置咒语补充
  suffix?: string // 后置咒语补充
  noGPT?: boolean // 不用gpt创作咒语
  spell?: string // 前一句咒语
}

export const defaultTxt2ImgOptions: StableDiffusionAPI = {
  // seed: -1,
  sampler_name: 'DPM++ SDE Karras',
  steps: 20,
  width: 512,
  height: 512,
  send_images: true,
}

export const defaultSpell = `
StableDiffusion是一款利用深度学习的文生图模型，支持通过使用提示词来产生新的图像，描述要包含或省略的元素。
我在这里引入StableDiffusion算法中的Prompt概念，又被称为提示符。
下面的prompt是用来指导AI绘画模型创作图像的。它们包含了图像的各种细节，如人物的外观、背景、颜色和光线效果，以及图像的主题和风格。这些prompt的格式经常包含括号内的加权数字，用于指定某些细节的重要性或强调。例如，"(masterpiece:1.5)"表示作品质量是非常重要的，多个括号也有类似作用。此外，如果使用中括号，如"{blue hair:white hair:0.3}"，这代表将蓝发和白发加以融合，蓝发占比为0.3。
以下是用prompt帮助AI模型生成图像的例子：masterpiece,(bestquality),highlydetailed,ultra-detailed,  cold , solo , ( 1girl ) , detailedeyes , shinegoldeneyes ) ( longliverhair ) expressionless , ( long sleeves , puffy sleeves ) ,  ( white wings ) , shinehalo , ( heavymetal : 1 . 2 ) , ( metaljewelry ) ,  cross-lacedfootwear ( chain ) ,  ( Whitedoves : 1 . 2 )

可以选择的prompt包括：

颜色
    light（明）
    dark（暗）
    pale（薄）
    deep（濃）

天气 时间
    golden hour lighting  （阳光照明）
    strong rim light      （强边缘光照）
    intense shadows  （强烈的阴影）
    in the rain            （雨）
    rainy days              （雨）
    sunset                  （日落）
    cloudy                   （多云）

建筑物
    in the baroque architecture     （巴洛克建筑 文艺复兴时期意大利的一种装修风格，外形自由，追求动感，喜好富丽）
    in the romanesque architecture streets        （罗马式街道）
    in the palace                                 （宫廷）
    at the castle（城的外观为背景）
    in the castle（城的内部为背景）
    in the street                                   （在街上）
    in the cyberpunk city                       （在赛博朋克城市里）
    rainy night in a cyberpunk city with glowing neon lights  （在雨天的赛博朋克城市，还有霓虹灯）
    at the lighthouse                               （在灯塔周围）
    in misty onsen                                 （温泉）
    by the moon                                     （月亮边上）
    in a bar, in bars                                   （酒吧）
    in a tavern                                        （居酒屋）
    Japanese arch                                  （鳥居）
    in a locker room                                 （在上锁的房间里）

山
    on a hill（山上）
    the top of the hill（山顶）

海
    on the beach       （海滩上）
    over the sea           （海边上）
    beautiful purple sunset at beach  （海边的美丽日落）
    in the ocean           （海中）
    on the ocean          （船上）

仿照例子，并不局限于我给你的单词，给出一套详细描述"{{prompt}}"的prompt，注意：masterpiece,(bestquality),highlydetailed,ultra-detailed 必须放在前面，prompt不能超过150个。直接开始给出prompt不需要用自然语言描述。
`

export const englishSpell = '我希望你能担任英语翻译、拼写校对和修辞改进的角色。我会用任何语言和你交流，你会识别语言，将其翻译并用更为优美和精炼的英语回答我。请将我简单的词汇和句子替换成更为准确的英语表达方式，确保意思不变。请直接输出翻译后的内容，不要写解释。我的第一句话是"{{prompt}}"，请翻译它。'
