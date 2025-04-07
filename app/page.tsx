import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Adaptation Survival</h1>
          <p className="text-muted-foreground mt-2">Create adaptations and test their survival</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Adaptation Survival</CardTitle>
            <CardDescription>
              Create a creature with unique adaptations and see if it can survive in different environments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Design structural, physiological, or behavioral adaptations, choose stat bonuses and drawbacks, then test
              your creature's survival chances in various environments.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/create">Create New Creature</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Survival Simulation</CardTitle>
            <CardDescription>See how creatures adapt and survive in different environments.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Watch as creatures compete for survival in marine, rainforest, tundra, and other environments. Witness
              extinction events and see which adaptations prevail.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/simulation">View Simulation</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

