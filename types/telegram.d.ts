export {}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
  }
  expand(): void
  ready(): void
  close(): void
  MainButton: {
    text: string
    show(): void
    hide(): void
    showProgress(): void
    hideProgress(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
}
