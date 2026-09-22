export type BaseMessageValue = string | BaseMessageTree

export interface BaseMessageTree {
  [key: string]: BaseMessageValue
}

export const messages: {
  en: BaseMessageTree
  es: BaseMessageTree
}
