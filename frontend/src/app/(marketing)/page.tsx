import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, FileText } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    description: 'Automatic structural analysis with intelligent code checking',
  },
  {
    icon: Shield,
    title: 'GB50017 Compliant',
    description: 'Built-in Chinese steel structure code verification',
  },
  {
    icon: FileText,
    title: 'Auto Report Generation',
    description: 'Generate professional reports in Markdown and JSON formats',
  },
]

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center flex-1 gap-8 p-8"
        aria-labelledby="hero-heading"
      >
        <h1 id="hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
          StructureClaw
        </h1>
        <p className="text-muted-foreground text-center max-w-md text-lg">
          结构工程 AI 工作台 - 美观、专业、易用
        </p>
        <Link href="/console">
          <Button size="lg" aria-label="Enter the Agent Console">
            Enter Console
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="px-8 pb-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
