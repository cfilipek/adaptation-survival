import type { ObjectId } from "mongodb"

export interface Creature {
  _id?: ObjectId
  name: string
  adaptationType: string
  adaptationDescription: string
  statBonuses: string[]
  statDrawback: string
  environment: string
  imageUrl: string
  imageId?: string
  survivalChance: number
  createdAt: Date
}

export interface Environment {
  _id?: ObjectId
  id: string
  name: string
  description: string
}

export interface SimulationEvent {
  _id?: ObjectId
  environmentId: string
  eventType: string
  description: string
  createdAt: Date
  survivors: string[]
  extinctCount: number
}

