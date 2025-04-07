"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import EnvironmentSimulation from "@/components/environment-simulation"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SimulationPage() {
  const [environments, setEnvironments] = useState([])
  const [creatures, setCreatures] = useState({})
  const [activeEnvironment, setActiveEnvironment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)
  const [survivors, setSurvivors] = useState<string[]>([])
  const [event, setEvent] = useState("")

  // Fetch environments and creatures on component mount
  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch environments
      console.log("Fetching environments...")
      const envResponse = await fetch("/api/environments")

      if (!envResponse.ok) {
        throw new Error(`Environment fetch failed: ${envResponse.status}`)
      }

      const envData = await envResponse.json()
      console.log("Environment data:", envData)

      if (envData.environments && envData.environments.length > 0) {
        setEnvironments(envData.environments)

        // Only set active environment if it's not already set
        if (!activeEnvironment) {
          setActiveEnvironment(envData.environments[0].id)
        }

        // Fetch all creatures
        console.log("Fetching creatures...")
        const creatureResponse = await fetch("/api/creatures")

        if (!creatureResponse.ok) {
          throw new Error(`Creature fetch failed: ${creatureResponse.status}`)
        }

        const creatureData = await creatureResponse.json()
        console.log("Creature data:", creatureData)

        // Group creatures by environment
        const groupedCreatures = {}
        if (creatureData.creatures) {
          creatureData.creatures.forEach((creature) => {
            if (!groupedCreatures[creature.environment]) {
              groupedCreatures[creature.environment] = []
            }
            groupedCreatures[creature.environment].push(creature)
          })
        }

        setCreatures(groupedCreatures)
      } else {
        console.warn("No environments found or empty environments array")
        // Try to debug the database connection
        const debugResponse = await fetch("/api/debug")
        const debugData = await debugResponse.json()
        console.log("Database debug info:", debugData)

        toast({
          title: "Warning",
          description: "No environments found. Please check the database connection.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: `Failed to load simulation data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const startSimulation = async () => {
    setIsSimulating(true)
    setSimulationComplete(false)

    try {
      const currentEnvCreatures = creatures[activeEnvironment] || []

      if (currentEnvCreatures.length === 0) {
        toast({
          title: "No creatures",
          description: "There are no creatures in this environment to simulate.",
        })
        setIsSimulating(false)
        return
      }

      // Run simulation
      const response = await fetch("/api/simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          environmentId: activeEnvironment,
          creatureIds: currentEnvCreatures.map((c) => c._id),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Simulation failed")
      }

      setEvent(data.event)
      setSurvivors(data.survivors)
      setSimulationComplete(true)
    } catch (error) {
      console.error("Error running simulation:", error)
      toast({
        title: "Simulation Error",
        description: "Failed to run the simulation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const resetSimulation = () => {
    setSimulationComplete(false)
    setSurvivors([])
    setEvent("")
  }

  const handleEnvironmentChange = (envId) => {
    setActiveEnvironment(envId)
    resetSimulation()
  }

  const handleCreatureDeleted = () => {
    // Refresh the data after a creature is deleted
    fetchData()
    // Reset the simulation if it was in progress
    resetSimulation()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Survival Simulation</CardTitle>
            <CardDescription>Watch how different creatures adapt and survive in various environments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeEnvironment} onValueChange={handleEnvironmentChange}>
              <TabsList className="flex flex-wrap gap-1 mb-4">
                {environments.map((env: any) => (
                  <TabsTrigger key={env.id} value={env.id} className="flex-1 min-w-[120px] py-2 px-3 text-sm">
                    {env.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {environments.map((env: any) => (
                <TabsContent key={env.id} value={env.id}>
                  <EnvironmentSimulation
                    environment={env}
                    creatures={creatures[env.id] || []}
                    isSimulating={isSimulating && activeEnvironment === env.id}
                    simulationComplete={simulationComplete && activeEnvironment === env.id}
                    survivors={survivors}
                    event={event}
                    onCreatureDeleted={handleCreatureDeleted}
                  />

                  <div className="flex justify-center mt-6">
                    {!simulationComplete ? (
                      <Button onClick={startSimulation} disabled={isSimulating} className="gap-2">
                        {isSimulating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Simulating...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Start Simulation
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={resetSimulation} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reset Simulation
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}

