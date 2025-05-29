import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return <main className="absolute top-[68px] bottom-0 left-0 right-0 flex items-center justify-center">
        <SignIn />
    </main>
}