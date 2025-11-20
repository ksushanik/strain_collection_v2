import { MainLayout } from "@/components/layout/main-layout"

export default function Home() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to BioCollection</h1>
        <p className="mt-2 text-muted-foreground">
          Select a module from the sidebar to get started.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard widgets will go here */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Total Strains</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Active Samples</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Storage Occupancy</h3>
            <p className="mt-2 text-3xl font-bold">0%</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
