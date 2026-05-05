import { $fetch } from "ofetch"
import { XMLParser } from "fast-xml-parser"
import { createHash } from "crypto"
import type { NewsItem, SourceGetter } from "./types"

export const myFetch = $fetch.create({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
})

export { load } from "cheerio"

export function defineRSSSource(url: string): SourceGetter {
  return async () => {
    const xml = new XMLParser({
      attributeNamePrefix: "",
      textNodeName: "$text",
      ignoreAttributes: false,
    })
    const data = await myFetch(url)
    const result = xml.parse(data as string)

    let channel = result.rss?.channel ?? result.feed
    if (Array.isArray(channel)) channel = channel[0]
    if (!channel) return []

    let items = channel.item ?? channel.entry ?? []
    if (!Array.isArray(items)) items = [items]

    return items.map((item: any) => ({
      id: item.guid?.["$text"] ?? item.id ?? item.link,
      title: item.title?.["$text"] ?? item.title ?? "",
      url: item.link?.href ?? item.link ?? "",
      pubDate: item.pubDate ?? item.updated ?? item.created,
    }))
  }
}

export function proxySource(proxyUrl: string, source: SourceGetter): SourceGetter {
  return source
}

export function defineSource<T>(source: T): T {
  return source
}

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"
export async function myCrypto(s: string, algorithm: Algorithm) {
  const algo = algorithm.toLowerCase().replace("-", "") as string
  return createHash(algo).update(s).digest("hex")
}

export async function md5(s: string) {
  return await myCrypto(s, "MD5")
}

export function encodeBase64(str: string) {
  return Buffer.from(str).toString("base64")
}
