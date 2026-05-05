import type { SourceGetter, SourceDefinition } from "./types"
import { Time } from "./constants"

// Import all sources
import _36kr from "./sources/_36kr"
import baidu from "./sources/baidu"
import bilibili from "./sources/bilibili"
import cankaoxiaoxi from "./sources/cankaoxiaoxi"
import chongbuluo from "./sources/chongbuluo"
import cls from "./sources/cls"
import coolapk from "./sources/coolapk"
import douban from "./sources/douban"
import douyin from "./sources/douyin"
import fastbull from "./sources/fastbull"
import freebuf from "./sources/freebuf"
import gelonghui from "./sources/gelonghui"
import ghxi from "./sources/ghxi"
import github from "./sources/github"
import hackernews from "./sources/hackernews"
import hupu from "./sources/hupu"
import ifeng from "./sources/ifeng"
import iqiyi from "./sources/iqiyi"
import ithome from "./sources/ithome"
import jin10 from "./sources/jin10"
import juejin from "./sources/juejin"
import kaopu from "./sources/kaopu"
import kuaishou from "./sources/kuaishou"
import linuxdo from "./sources/linuxdo"
import mktnews from "./sources/mktnews"
import nowcoder from "./sources/nowcoder"
import pcbeta from "./sources/pcbeta"
import producthunt from "./sources/producthunt"
import qqvideo from "./sources/qqvideo"
import smzdm from "./sources/smzdm"
import solidot from "./sources/solidot"
import sputniknewscn from "./sources/sputniknewscn"
import sspai from "./sources/sspai"
import steam from "./sources/steam"
import tencent from "./sources/tencent"
import thepaper from "./sources/thepaper"
import tieba from "./sources/tieba"
import toutiao from "./sources/toutiao"
import v2ex from "./sources/v2ex"
import wallstreetcn from "./sources/wallstreetcn"
import weibo from "./sources/weibo"
import xueqiu from "./sources/xueqiu"
import zaobao from "./sources/zaobao"
import zhihu from "./sources/zhihu"

export interface SourceMeta {
  getter: SourceGetter
  definition: SourceDefinition
}

function buildSources(): Map<string, SourceMeta> {
  const map = new Map<string, SourceMeta>()

  const defs: Record<string, { meta: SourceDefinition; getter: SourceGetter | Record<string, SourceGetter> }> = {
    "v2ex": {
      meta: { name: "V2EX", color: "slate", column: "tech", home: "https://v2ex.com/" },
      getter: v2ex,
    },
    zhihu: {
      meta: { name: "知乎", type: "hottest", column: "china", color: "blue", home: "https://www.zhihu.com" },
      getter: zhihu,
    },
    weibo: {
      meta: { name: "微博", title: "实时热搜", type: "hottest", column: "china", color: "red", interval: Time.Realtime, home: "https://weibo.com" },
      getter: weibo,
    },
    zaobao: {
      meta: { name: "联合早报", interval: Time.Common, type: "realtime", column: "world", color: "red", desc: "来自第三方网站: 早晨报", home: "https://www.zaobao.com" },
      getter: zaobao,
    },
    coolapk: {
      meta: { name: "酷安", type: "hottest", column: "tech", color: "green", title: "今日最热", home: "https://coolapk.com" },
      getter: coolapk,
    },
    mktnews: {
      meta: { name: "MKTNews", column: "finance", color: "indigo", interval: Time.Realtime, home: "https://mktnews.net" },
      getter: mktnews,
    },
    wallstreetcn: {
      meta: { name: "华尔街见闻", color: "blue", column: "finance", home: "https://wallstreetcn.com/" },
      getter: wallstreetcn,
    },
    "36kr": {
      meta: { name: "36氪", type: "realtime", color: "blue", column: "tech", home: "https://36kr.com" },
      getter: _36kr,
    },
    douyin: {
      meta: { name: "抖音", type: "hottest", column: "china", color: "gray", home: "https://www.douyin.com" },
      getter: douyin,
    },
    hupu: {
      meta: { name: "虎扑", title: "主干道热帖", type: "hottest", column: "china", color: "red", home: "https://hupu.com" },
      getter: hupu,
    },
    tieba: {
      meta: { name: "百度贴吧", title: "热议", type: "hottest", column: "china", color: "blue", home: "https://tieba.baidu.com" },
      getter: tieba,
    },
    toutiao: {
      meta: { name: "今日头条", type: "hottest", column: "china", color: "red", home: "https://www.toutiao.com" },
      getter: toutiao,
    },
    ithome: {
      meta: { name: "IT之家", type: "realtime", color: "red", column: "tech", home: "https://www.ithome.com" },
      getter: ithome,
    },
    thepaper: {
      meta: { name: "澎湃新闻", interval: Time.Common, type: "hottest", column: "china", title: "热榜", color: "gray", home: "https://www.thepaper.cn" },
      getter: thepaper,
    },
    sputniknewscn: {
      meta: { name: "卫星通讯社", color: "orange", column: "world", home: "https://sputniknews.cn" },
      getter: sputniknewscn,
    },
    cankaoxiaoxi: {
      meta: { name: "参考消息", color: "red", column: "world", interval: Time.Common, home: "https://china.cankaoxiaoxi.com" },
      getter: cankaoxiaoxi,
    },
    pcbeta: {
      meta: { name: "远景论坛", color: "blue", column: "tech", home: "https://bbs.pcbeta.com" },
      getter: pcbeta,
    },
    cls: {
      meta: { name: "财联社", color: "red", column: "finance", home: "https://www.cls.cn" },
      getter: cls,
    },
    xueqiu: {
      meta: { name: "雪球", color: "blue", column: "finance", home: "https://xueqiu.com" },
      getter: xueqiu,
    },
    gelonghui: {
      meta: { name: "格隆汇", title: "事件", type: "realtime", column: "finance", color: "blue", interval: Time.Realtime, home: "https://www.gelonghui.com" },
      getter: gelonghui,
    },
    fastbull: {
      meta: { name: "法布财经", color: "emerald", column: "finance", home: "https://www.fastbull.cn" },
      getter: fastbull,
    },
    solidot: {
      meta: { name: "Solidot", color: "teal", column: "tech", interval: Time.Slow, home: "https://solidot.org" },
      getter: solidot,
    },
    hackernews: {
      meta: { name: "Hacker News", color: "orange", column: "tech", type: "hottest", home: "https://news.ycombinator.com/" },
      getter: hackernews,
    },
    producthunt: {
      meta: { name: "Product Hunt", color: "red", column: "tech", type: "hottest", home: "https://www.producthunt.com/" },
      getter: producthunt,
    },
    github: {
      meta: { name: "Github", color: "gray", column: "tech", home: "https://github.com/" },
      getter: github,
    },
    bilibili: {
      meta: { name: "哔哩哔哩", color: "blue", home: "https://www.bilibili.com" },
      getter: bilibili,
    },
    kaopu: {
      meta: { name: "靠谱新闻", column: "world", color: "gray", interval: Time.Common, desc: "不一定靠谱，多看多思考", home: "https://kaopu.news/" },
      getter: kaopu,
    },
    jin10: {
      meta: { name: "金十数据", type: "realtime", column: "finance", color: "blue", home: "https://www.jin10.com" },
      getter: jin10,
    },
    baidu: {
      meta: { name: "百度热搜", type: "hottest", column: "china", color: "blue", home: "https://www.baidu.com" },
      getter: baidu,
    },
    linuxdo: {
      meta: { name: "LINUX DO", column: "tech", color: "slate", home: "https://linux.do/", disable: true },
      getter: linuxdo,
    },
    ghxi: {
      meta: { name: "果核剥壳", column: "china", color: "yellow", home: "https://www.ghxi.com/", disable: true },
      getter: ghxi,
    },
    smzdm: {
      meta: { name: "什么值得买", column: "china", color: "red", type: "hottest", home: "https://www.smzdm.com", disable: true },
      getter: smzdm,
    },
    nowcoder: {
      meta: { name: "牛客", column: "china", color: "blue", type: "hottest", home: "https://www.nowcoder.com" },
      getter: nowcoder,
    },
    sspai: {
      meta: { name: "少数派", column: "tech", color: "red", type: "hottest", home: "https://sspai.com" },
      getter: sspai,
    },
    juejin: {
      meta: { name: "稀土掘金", column: "tech", color: "blue", type: "hottest", home: "https://juejin.cn" },
      getter: juejin,
    },
    ifeng: {
      meta: { name: "凤凰网", title: "热点资讯", type: "hottest", column: "china", color: "red", home: "https://www.ifeng.com" },
      getter: ifeng,
    },
    chongbuluo: {
      meta: { name: "虫部落", column: "china", color: "green", home: "https://www.chongbuluo.com" },
      getter: chongbuluo,
    },
    douban: {
      meta: { name: "豆瓣", title: "热门电影", type: "hottest", column: "china", color: "green", home: "https://www.douban.com" },
      getter: douban,
    },
    steam: {
      meta: { name: "Steam", title: "在线人数", type: "hottest", column: "world", color: "blue", home: "https://store.steampowered.com" },
      getter: steam,
    },
    tencent: {
      meta: { name: "腾讯新闻", column: "china", color: "blue", home: "https://news.qq.com" },
      getter: tencent,
    },
    freebuf: {
      meta: { name: "Freebuf", title: "网络安全", type: "hottest", column: "china", color: "green", home: "https://www.freebuf.com/" },
      getter: freebuf,
    },
    qqvideo: {
      meta: { name: "腾讯视频", column: "china", color: "blue", home: "https://v.qq.com/" },
      getter: qqvideo,
    },
    iqiyi: {
      meta: { name: "爱奇艺", column: "china", color: "green", home: "https://www.iqiyi.com" },
      getter: iqiyi,
    },
  }

  for (const [id, { meta, getter }] of Object.entries(defs)) {
    // Skip disabled-by-default sources
    if (meta.disable === true) continue

    if (typeof getter === "function") {
      map.set(id, { getter, definition: meta })
    } else {
      // Multi-sub-source: getter is an object like { "cls-telegraph": fn, "cls-depth": fn }
      for (const [subId, subGetter] of Object.entries(getter)) {
        map.set(subId, { getter: subGetter, definition: { ...meta, title: undefined } })
      }
    }
  }

  return map
}

export const sources = buildSources()

export function getSourceIDs(): string[] {
  return Array.from(sources.keys())
}
