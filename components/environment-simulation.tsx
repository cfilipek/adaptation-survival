"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skull, AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { capitalizeFirstLetter } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Creature = {
  _id: string
  name: string
  adaptationType: string
  adaptationDescription: string
  statBonuses: string[]
  statDrawback: string
  imageUrl: string
  survivalChance: number
}

type Environment = {
  id: string
  name: string
  description: string
}

type EnvironmentSimulationProps = {
  environment: Environment
  creatures: Creature[]
  isSimulating: boolean
  simulationComplete: boolean
  survivors: string[]
  event: string
  onCreatureDeleted?: () => void
}

export default function EnvironmentSimulation({
  environment,
  creatures,
  isSimulating,
  simulationComplete,
  survivors,
  event,
  onCreatureDeleted,
}: EnvironmentSimulationProps) {
  const [deletingCreatureId, setDeletingCreatureId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Map environment IDs to background images/colors
  const environmentStyles: Record<string, { bgColor: string; name: string }> = {
    marine: {
      bgColor: "bg-blue-500/10",
      name: "Marine",
    },
    rainforest: {
      bgColor: "bg-green-500/10",
      name: "Rainforest",
    },
    tundra: {
      bgColor: "bg-slate-300/30",
      name: "Tundra",
    },
    desert: {
      bgColor: "bg-amber-500/10",
      name: "Desert",
    },
    grassland: {
      bgColor: "bg-lime-500/10",
      name: "Grassland",
    },
  }

  const envStyle = environmentStyles[environment.id] || { bgColor: "bg-muted", name: environment.name }

  const handleDeleteCreature = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/creatures/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete creature")
      }

      toast({
        title: "Creature deleted",
        description: "The creature has been removed from the environment.",
      })

      // Refresh the creatures list
      if (onCreatureDeleted) {
        onCreatureDeleted()
      }
    } catch (error) {
      console.error("Error deleting creature:", error)
      toast({
        title: "Error",
        description: `Failed to delete creature: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingCreatureId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{environment.name} Environment</CardTitle>
            <CardDescription>{environment.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSimulating && event && (
              <Alert className="mb-4 border-yellow-500 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Environmental Event!</AlertTitle>
                <AlertDescription>{event}</AlertDescription>
              </Alert>
            )}

            <div className={`relative h-48 ${envStyle.bgColor} rounded-md overflow-hidden`}>
              {/* This would be a visualization of the environment */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">{environment.name} Environment Visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Creatures in this Environment</h3>
            <Button variant="outline" size="sm" asChild>
              <a href="/create">Add Creature</a>
            </Button>
          </div>

          {creatures.length === 0 ? (
            <p className="text-muted-foreground">No creatures have been added to this environment yet.</p>
          ) : (
            creatures.map((creature) => {
              const isExtinct = simulationComplete && !survivors.includes(creature._id)

              return (
                <Card key={creature._id} className={`${isExtinct ? "opacity-50" : ""} transition-opacity`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 relative">
                        <img
                          src={creature.imageUrl || "/placeholder.svg?height=100&width=100"}
                          alt={creature.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        {isExtinct && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                            <Skull className="text-white h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h4 className="font-medium">{creature.name}</h4>
                            {isExtinct && (
                              <Badge variant="destructive" className="ml-2">
                                Extinct
                              </Badge>
                            )}
                            {simulationComplete && !isExtinct && (
                              <Badge variant="outline" className="ml-2 bg-green-500 text-white">
                                Survived
                              </Badge>
                            )}
                          </div>

                          {!isSimulating && !simulationComplete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeletingCreatureId(creature._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Creature</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {creature.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCreature(creature._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting && deletingCreatureId === creature._id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>

                        <div>
                          <Badge variant="outline">{capitalizeFirstLetter(creature.adaptationType)}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {creature.statBonuses.map((stat, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              +{capitalizeFirstLetter(stat)}
                            </Badge>
                          ))}
                          <Badge variant="destructive" className="text-xs">
                            -{capitalizeFirstLetter(creature.statDrawback)}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">{creature.adaptationDescription}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {simulationComplete && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>
              {survivors.length === 0
                ? "All creatures have gone extinct in this environment!"
                : `${survivors.length} out of ${creatures.length} creatures survived the event.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Event:</strong> {event}
              </p>

              {survivors.length > 0 && (
                <>
                  <p className="text-sm font-medium">Survivors:</p>
                  <div className="flex flex-wrap gap-2">
                    {survivors.map((id) => {
                      const creature = creatures.find((c) => c._id === id)
                      return creature ? (
                        <Badge key={id} variant="outline" className="bg-green-500/10">
                          {creature.name}
                        </Badge>
                      ) : null
                    })}
                  </div>

                  <p className="text-sm mt-4">
                    These creatures survived due to their adaptations that were well-suited for the environmental event.
                  </p>
                </>
              )}

              {creatures.length > 0 && survivors.length < creatures.length && (
                <>
                  <p className="text-sm font-medium">Extinct:</p>
                  <div className="flex flex-wrap gap-2">
                    {creatures
                      .filter((c) => !survivors.includes(c._id))
                      .map((creature) => (
                        <Badge key={creature._id} variant="outline" className="bg-red-500/10">
                          {creature.name}
                        </Badge>
                      ))}
                  </div>

                  <p className="text-sm mt-4">
                    These creatures couldn't survive the event due to maladaptive features for this specific
                    environmental challenge.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

