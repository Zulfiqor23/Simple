import type { Metadata } from 'next'
import GarderobPage from '@/components/GarderobPage'

export const metadata: Metadata = {
  title: 'Garderob Modullari — Bazis Proyekt',
}

export default function Garderob() {
  return <GarderobPage />
}
