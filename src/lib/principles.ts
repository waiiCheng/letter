/**
 * 这个文件是设计宪法。
 * 写任何地点的代码或文字前,回到这里。
 *
 * 真实是基准。
 * 认真且不被发现的认真。
 * 减少摩擦,不是在摩擦中先失去。
 * 我会影响他他会影响我。
 * 他可能永远不会打开。我们总是不知道谁能永远的在。
 * 双向是礼物,单向也完整。
 * 门后绝对静止。零 fade-in、零延迟、零渐变。Hard cut——第 0 毫秒字就在那里。
 * 唯一例外:Home 的入口仪式保留 glitching / decrypting——那是跨越边界的摩擦,不是门后的优雅过渡。
 */

export const EXCEPTIONS_TO_HARD_CUT = [
  'home_raw_entry_ritual',       // Home 入口仪式:glitch + 横线 + 跳转
  'bare_scroll_reveal_sub_200ms', // Bare 段落滚动进入:< 200ms opacity,不是装饰是感知
] as const;
export const PRINCIPLES = {
  Raw: "首页。带着血丝的、没有经过任何烹饪和摆盘的真实。",
  Bare: "说明书。拆除了承重墙之外所有装饰的家徒四壁。",
  Spill: "抽屉。容器装不下了,流到地上的东西。不完美,甚至有点狼狈,但我允许你看到。",
  Carve: "回忆。不是拿笔写在纸上,是拿刀刻在金属上。你做的某件事,在我这里留下了一道去不掉的痕迹。",
  Parallax: "镜子。两个视角的差,让你看到距离。你看他在 Bare 留下的回应,跟你写的原话并置——你看到你们之间的距离。",
} as const;
