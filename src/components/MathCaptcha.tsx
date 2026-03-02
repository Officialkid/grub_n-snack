'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

type Operation = '+' | '-' | '×'

interface Question {
  a: number
  b: number
  operation: Operation
  answer: number
}

interface MathCaptchaProps {
  onValidChange: (isValid: boolean) => void
  error?: string
}

function generateQuestion(): Question {
  const operations: Operation[] = ['+', '-', '×']
  const operation = operations[Math.floor(Math.random() * operations.length)]

  let a: number
  let b: number
  let answer: number

  if (operation === '+') {
    a = Math.floor(Math.random() * 2900) + 1
    b = Math.floor(Math.random() * 2900) + 1
    answer = a + b
  } else if (operation === '-') {
    // Ensure answer is always positive
    a = Math.floor(Math.random() * 2900) + 1
    b = Math.floor(Math.random() * a) + 1
    answer = a - b
  } else {
    // Multiplication — keep numbers smaller so it's solvable
    a = Math.floor(Math.random() * 99) + 1
    b = Math.floor(Math.random() * 99) + 1
    answer = a * b
  }

  return { a, b, operation, answer }
}

export default function MathCaptcha({
  onValidChange,
  error,
}: MathCaptchaProps) {
  const [question, setQuestion] = useState<Question>(generateQuestion)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [touched, setTouched] = useState(false)

  const refreshQuestion = useCallback(() => {
    setQuestion(generateQuestion())
    setUserAnswer('')
    setIsCorrect(false)
    setTouched(false)
    onValidChange(false)
  }, [onValidChange])

  useEffect(() => {
    const parsed = parseInt(userAnswer, 10)
    const correct = !isNaN(parsed) && parsed === question.answer

    setIsCorrect(correct)
    onValidChange(correct)
  }, [userAnswer, question.answer, onValidChange])

  const borderColor = !touched
    ? '#d1d5db'
    : isCorrect
    ? '#22c55e'
    : '#ef4444'

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium"
        style={{ color: '#242a41' }}
      >
        Prove you are human{' '}
        <span style={{ color: '#e3720d' }}>*</span>
      </label>

      <div
        className="flex items-center gap-3 p-4 rounded-xl border-2 transition-colors"
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: !touched ? '#e5e7eb' : isCorrect ? '#22c55e' : '#fca5a5',
        }}
      >
        {/* Question display */}
        <div className="flex-1">
          <p
            className="text-lg font-bold tracking-wide"
            style={{
              color: '#242a41',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            {question.a} {question.operation} {question.b} = ?
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={refreshQuestion}
          className="p-2 rounded-lg transition-colors hover:bg-gray-200 shrink-0"
          title="Get a new question"
          aria-label="Generate new math question"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Answer input */}
      <div className="relative">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => {
            setUserAnswer(e.target.value)
            setTouched(true)
          }}
          placeholder="Type your answer here"
          className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
          style={{ borderColor }}
        />
        {touched && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
            {isCorrect ? '✅' : '❌'}
          </span>
        )}
      </div>

      {touched && !isCorrect && userAnswer !== '' && (
        <p className="text-xs text-red-500">
          Incorrect answer. Try again or refresh for a new question.
        </p>
      )}

      {touched && isCorrect && (
        <p className="text-xs text-green-600 font-medium">
          Correct! You are verified.
        </p>
      )}

      {error && !touched && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
