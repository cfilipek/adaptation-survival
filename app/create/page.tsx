"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, ArrowRight, Upload, Loader2 } from "lucide-react"
import CreaturePreview from "@/components/creature-preview"
import { useEffect } from "react"

export default function CreateCreature() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [environments, setEnvironments] = useState([])
  const [creature, setCreature] = useState({
    name: "",
    adaptationType: "",
    adaptationDescription: "",
    statBonuses: ["", ""],
    statDrawback: "",
    environment: "",
    image: null as File | null,
    imagePreview: "",
    imageUrl: "",
    imageId: "",
  })

  // Fetch environments on component mount
  useEffect(() => {
    async function fetchEnvironments() {
      try {
        const response = await fetch("/api/environments")
        const data = await response.json()
        if (data.environments) {
          setEnvironments(data.environments)
        }
      } catch (error) {
        console.error("Error fetching environments:", error)
        toast({
          title: "Error",
          description: "Failed to load environments. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchEnvironments()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setCreature({
        ...creature,
        image: file,
        imagePreview: URL.createObjectURL(file),
      })
    }
  }

  const uploadImage = async () => {
    if (!creature.image) return null

    const formData = new FormData()
    formData.append("file", creature.image)

    try {
      console.log(`Uploading image to MongoDB: ${creature.image.name}, size: ${creature.image.size} bytes`)

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload response error:", response.status, errorText)
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || data.details || "Failed to upload image")
      }

      console.log("Upload successful:", data.url)
      return {
        url: data.url,
        fileId: data.fileId,
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // If no image was selected, we can still create the creature with a placeholder
      let imageUrl = creature.imageUrl || "/placeholder.svg?height=100&width=100"
      let imageId = creature.imageId || ""

      // Upload image if one was selected
      if (creature.image) {
        const uploadResult = await uploadImage()
        if (uploadResult) {
          imageUrl = uploadResult.url
          imageId = uploadResult.fileId
        } else {
          // If upload fails but we want to continue anyway, use a placeholder
          console.log("Using placeholder image due to upload failure")
        }
      }

      // Create creature in database
      const response = await fetch("/api/creatures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: creature.name,
          adaptationType: creature.adaptationType,
          adaptationDescription: creature.adaptationDescription,
          statBonuses: creature.statBonuses,
          statDrawback: creature.statDrawback,
          environment: creature.environment,
          imageUrl,
          imageId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create creature")
      }

      toast({
        title: "Creature created!",
        description: `${creature.name} has been added to the ${creature.environment} environment.`,
      })

      // Redirect to simulation page
      setTimeout(() => {
        router.push("/simulation")
      }, 2000)
    } catch (error) {
      console.error("Error creating creature:", error)
      toast({
        title: "Error",
        description: `There was a problem creating your creature: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="max-w-md w-full">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Creature</CardTitle>
            <CardDescription>Step {step} of 4</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Creature Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter a name for your creature"
                    value={creature.name}
                    onChange={(e) => setCreature({ ...creature, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Adaptation Type</Label>
                  <RadioGroup
                    value={creature.adaptationType}
                    onValueChange={(value) => setCreature({ ...creature, adaptationType: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="structural" id="structural" />
                      <Label htmlFor="structural">Structural</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physiological" id="physiological" />
                      <Label htmlFor="physiological">Physiological</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="behavioral" id="behavioral" />
                      <Label htmlFor="behavioral">Behavioral</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Adaptation Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your creature's adaptation"
                    value={creature.adaptationDescription}
                    onChange={(e) => setCreature({ ...creature, adaptationDescription: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Stat Bonuses (Choose 2)</Label>
                  <Select
                    value={creature.statBonuses[0]}
                    onValueChange={(value) =>
                      setCreature({
                        ...creature,
                        statBonuses: [value, creature.statBonuses[1]],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select first stat bonus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="agility">Agility</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="intelligence">Intelligence</SelectItem>
                      <SelectItem value="stealth">Stealth</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={creature.statBonuses[1]}
                    onValueChange={(value) =>
                      setCreature({
                        ...creature,
                        statBonuses: [creature.statBonuses[0], value],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select second stat bonus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="agility">Agility</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="intelligence">Intelligence</SelectItem>
                      <SelectItem value="stealth">Stealth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stat Drawback (Choose 1)</Label>
                  <Select
                    value={creature.statDrawback}
                    onValueChange={(value) => setCreature({ ...creature, statDrawback: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stat drawback" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="agility">Agility</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="intelligence">Intelligence</SelectItem>
                      <SelectItem value="stealth">Stealth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select
                    value={creature.environment}
                    onValueChange={(value) => setCreature({ ...creature, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.map((env: any) => (
                        <SelectItem key={env.id} value={env.id}>
                          {env.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload Creature Image</Label>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        {creature.imagePreview ? (
                          <img
                            src={creature.imagePreview || "/placeholder.svg"}
                            alt="Creature preview"
                            className="max-h-40 object-contain mb-2"
                          />
                        ) : (
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {creature.imagePreview ? "Change image" : "Upload an image of your creature (optional)"}
                        </span>
                      </div>
                    </Label>
                    <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Your Creature</h3>
                <CreaturePreview creature={creature} />

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Survival Analysis</h4>
                  <p className="text-sm">
                    Based on your creature's adaptations and the chosen environment, we estimate a 68% chance of
                    survival in the {creature.environment} environment.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={nextStep}
                className={step > 1 ? "ml-auto" : ""}
                disabled={
                  (step === 1 && (!creature.name || !creature.adaptationType)) ||
                  (step === 2 && (!creature.statBonuses[0] || !creature.statBonuses[1] || !creature.statDrawback)) ||
                  (step === 3 && !creature.environment)
                }
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Creature"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}

