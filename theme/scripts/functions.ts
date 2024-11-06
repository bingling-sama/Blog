export type Post = {
  date: string
  title: string
  category: string
  tags: string[]
  description: string
  url: string
}

export function initTags(post: Post[]): Map<string, Post[]> {
  const data = {} as Map<string, Post[]>
  for (let index = 0; index < post.length; index++) {
    const element = post[index]
    const tags = element.tags
    if (tags) {
      tags.forEach((item) => {
        if (data[item]) {
          data[item].push(element)
        } else {
          data[item] = []
          data[item].push(element)
        }
      })
    }
  }
  return data
}

export function initCategory(post: Post[]): { [key: string]: Post[] } {
  const data: any = {}
  for (let index = 0; index < post.length; index++) {
    const element = post[index]
    const category = element.category
    if (category) {
      if (data[category]) {
        data[category].push(element)
      } else {
        data[category] = []
        data[category].push(element)
      }
    }
  }
  return data
}

export function useYearSort(post: Post[]): Array<Post[]> {
  const data = [] as Array<Post[]>
  let year = "0"
  let num = -1
  for (let index = 0; index < post.length; index++) {
    const element = post[index]
    if (element.date) {
      const y = element.date.split("-")[0]
      if (y === year) {
        data[num].push(element)
      } else {
        num++
        data[num] = [] as any
        data[num].push(element)
        year = y
      }
    }
  }
  return data
}
