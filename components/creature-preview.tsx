import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { capitalizeFirstLetter } from "@/lib/utils"

type CreatureProps = {
  creature: {
    name: string
    adaptationType: string
    adaptationDescription: string
    statBonuses: string[]
    statDrawback: string
    environment: string
    imagePreview?: string
    imageUrl?: string
  }
}

export default function CreaturePreview({ creature }: CreatureProps) {
  // Get the image source - either preview (for new creatures) or URL (for saved creatures)
  const imageSrc = creature.imagePreview || creature.imageUrl || "/placeholder.svg?height=100&width=100"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <img
              src={imageSrc || "/placeholder.svg"}
              alt={creature.name}
              className="w-full md:w-32 h-32 object-cover rounded-md"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg">{creature.name || "Unnamed Creature"}</h3>

            <div>
              <span className="text-sm font-medium">Adaptation Type:</span>
              <Badge variant="outline" className="ml-2">
                {capitalizeFirstLetter(creature.adaptationType) || "None"}
              </Badge>
            </div>

            <div>
              <span className="text-sm font-medium">Environment:</span>
              <Badge variant="outline" className="ml-2">
                {capitalizeFirstLetter(creature.environment) || "None"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1">
              <span className="text-sm font-medium">Stats:</span>
              {creature.statBonuses.map(
                (stat, index) =>
                  stat && (
                    <Badge key={index} variant="secondary" className="ml-1">
                      +{capitalizeFirstLetter(stat)}
                    </Badge>
                  ),
              )}
              {creature.statDrawback && (
                <Badge key="drawback" variant="destructive" className="ml-1">
                  -{capitalizeFirstLetter(creature.statDrawback)}
                </Badge>
              )}
            </div>

            {creature.adaptationDescription && (
              <p className="text-sm text-muted-foreground">{creature.adaptationDescription}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

