import { Geist, Geist_Mono, Lato, Cedarville_Cursive } from "next/font/google";

export const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const cedarville = Cedarville_Cursive({
    variable: "--font-cedarville",
    weight: ["400"],
    subsets: ["latin"]
})

export const lato = Lato({
    variable: "--font-lato",
    weight: ["300", "400", "700"],
    subsets: ["latin"]
})