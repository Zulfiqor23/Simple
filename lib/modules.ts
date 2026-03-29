export interface Module {
  id: string
  name: string
  price: number
  image: string
  description: string
  dimensions: { w: number; h: number; d: number }
}

export const G_MODULES: Module[] = [
  {
    id: 'G001',
    name: 'Garderob Scandi',
    price: 4500000,
    image: 'Scandi',
    description: 'Skandinavcha uslubdagi keng va shinam garderob. 2 eshikli, javonli va kiyim ilgichli.',
    dimensions: { w: 1200, h: 2200, d: 600 },
  },
  {
    id: 'G002',
    name: 'Garderob W1 Premium',
    price: 5800000,
    image: 'W1',
    description: 'Premium toifadagi garderob. Sifatli materiallardan tayyorlangan, zamonaviy dizayn.',
    dimensions: { w: 1600, h: 2400, d: 600 },
  },
  {
    id: 'G003',
    name: 'Garderob missKorea',
    price: 3900000,
    image: 'missKorea',
    description: 'Elegant va ixcham garderob. Kichik xonalar uchun ideal yechim.',
    dimensions: { w: 1000, h: 2100, d: 550 },
  },
  {
    id: 'G004',
    name: 'Garderob W2 Modern',
    price: 6200000,
    image: 'W2',
    description: "Modern uslubdagi 3 eshikli garderob. Katta oilalar uchun mo'ljallangan.",
    dimensions: { w: 2000, h: 2400, d: 600 },
  },
  {
    id: 'G005',
    name: 'Garderob W3 Classic',
    price: 4800000,
    image: 'W3',
    description: 'Klassik dizayndagi garderob. Mustahkam va chiroyli.',
    dimensions: { w: 1400, h: 2200, d: 600 },
  },
  {
    id: 'G006',
    name: 'Garderob W4 Luxury',
    price: 7500000,
    image: 'W4',
    description: 'Lyuks toifadagi keng garderob. Orqa yoritgichli va yumshoq yopilish tizimiga ega.',
    dimensions: { w: 2400, h: 2600, d: 650 },
  },
]
