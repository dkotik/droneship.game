import { z } from 'astro:content'

const bannedSlugStopWords = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'hed',
  'hes',
  'her',
  'here',
  'heres',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'hows',
  'i',
  'ive',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'lets',
  'many',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'nor',
  'of',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'shes',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'thats',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'theres',
  'these',
  'they',
  'theyd',
  'theyll',
  'theyre',
  'theyve',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'wed',
  'weve',
  'were',
  'what',
  'whats',
  'when',
  'whens',
  'where',
  'wheres',
  'which',
  'while',
  'who',
  'whos',
  'whom',
  'why',
  'whys',
  'with',
  'would',
  'you',
  'youd',
  'youll',
  'youre',
  'youve',
  'your',
  'yours',
  'yourself',
  'yourselves'
])

const duplicates = new Set()
const validStopWord = /^[a-z0-9]{3,}$/
// const extract = /([^\/]+)\.\w+$/
const cutOff = /\.\w+$/

export default z.string({
  required_error: "URL slug is required",
  invalid_type_error: "URL slug must be a string",
}).min(6).refine(
  (val) => val.length < 60,
  (val) => ({ message: `URL slug ${val} exceeds 60 characters in length` })
).superRefine((val, ctx) => {
  const path = val.replace(cutOff, '').split('/')
  const words = new Set()
  let foldWordCount = 0

  for (const fold of path) {
    foldWordCount = 0
    for (const word of fold.split('-')) {
      foldWordCount++
      if (!validStopWord.test(word)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_string,
          message: `Word "${word}" is not a valid URL slug stop word. It must contain only digits or lowercase letters.`,
        })
        return z.NEVER
      }

      if (bannedSlugStopWords.has(word)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_string,
          message: `Word "${word}" must never occur in a URL slug.`,
        })
        return z.NEVER
      }

      // Never repeat your keywords (or any words for that matter) in a whole URL, not just the slug.
      if (words.has(word)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Word "${word}" is not unique in URL slug path.`,
        })
        return z.NEVER
      }
      words.add(word)
    }

    if (foldWordCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: `URL slug element "${fold}" contains no words.`,
      })
      return z.NEVER
    }
  }

  if (foldWordCount < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_string,
      message: `Slug tail "${path.slice(-1)}" must contain at least three words.`,
    })
    return z.NEVER
  }

  const glued = [...words].sort().join('-')
  if (duplicates.has(glued)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Slug "${glued}" is not unique for this site.`,
    })
    return z.NEVER
  }
  duplicates.add(glued)
})
