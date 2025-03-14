"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import type { BookingType } from "@/types/booking-type"
import { toast } from "@/hooks/use-toast"
import { Grip, Plus, Trash } from "lucide-react"

interface Question {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "checkbox"
  required: boolean
  options?: string[]
}

interface BookingTypeQuestionsProps {
  bookingType?: BookingType | null
}

export function BookingTypeQuestions({ bookingType }: BookingTypeQuestionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      id: "2",
      label: "Email",
      type: "text",
      required: true,
    },
  ])

  const addQuestion = () => {
    const newId = (questions.length + 1).toString()
    setQuestions([
      ...questions,
      {
        id: newId,
        label: "New Question",
        type: "text",
        required: false,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Questions updated",
        description: "Your booking questions have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to save questions:", error)
      toast({
        title: "Error",
        description: "Failed to save booking questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Questions</CardTitle>
          <CardDescription>Customize the questions you ask when someone books this meeting type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <Grip className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`question-${question.id}`}>Question {index + 1}</Label>
                  <Input
                    id={`question-${question.id}`}
                    value={question.label}
                    onChange={(e) => updateQuestion(question.id, "label", e.target.value)}
                  />
                </div>
                {index > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove question</span>
                  </Button>
                )}
              </div>
              <div className="ml-7 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`type-${question.id}`}>Type</Label>
                  <Select value={question.type} onValueChange={(value) => updateQuestion(question.id, "type", value)}>
                    <SelectTrigger id={`type-${question.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="select">Multiple Choice</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked) => updateQuestion(question.id, "required", checked)}
                    disabled={index < 2} // Name and Email are always required
                  />
                  <Label htmlFor={`required-${question.id}`}>Required</Label>
                </div>
              </div>
              {index < questions.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          <Button variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

