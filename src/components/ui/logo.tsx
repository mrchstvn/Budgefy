import { cedarville } from "@/components/fonts/fonts";
import Link from "next/link";

export default function Logo() {
    return (
        <div
            className={`${cedarville.className} antialiased hidden md:block md:px-4 md:py-2 md:flex md:flex-row md:w-full md:justify-center`}
        >
            <Link href='/dashboard'>
                <span className=" text-5xl font-bold ">B</span>
                <span className="text-lg  lg:block">udgefy</span>
            </Link>
        </div>


    )
}